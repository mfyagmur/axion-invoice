from app.services.pdf_service import (
    _classify_elements,
    _footer_group_top_mm,
    _paginate_table_rows,
)


def _table_element(**overrides):
    element = {
        "id": "table-1",
        "type": "table",
        "x_mm": 15,
        "y_mm": 90,
        "width_mm": 180,
        "height_mm": 140,
        "row_height_mm": 6,
        "row_font_size": 8,
        "header_font_size": 8,
        "show_totals": True,
    }
    element.update(overrides)
    return element


def _line_items(count: int) -> list[dict]:
    return [{"row_number": i + 1, "description": f"Item {i}"} for i in range(count)]


def test_classify_elements_no_table_returns_none_and_all_elements():
    elements = [{"type": "text", "y_mm": 10, "height_mm": 5}]
    table_element, repeat_elements, footer_elements = _classify_elements(elements)
    assert table_element is None
    assert repeat_elements == elements
    assert footer_elements == []


def test_classify_elements_splits_above_and_below_table_by_y():
    header = {"type": "text", "y_mm": 10, "height_mm": 20}  # bottom = 30 <= table.y(90)
    totals = {"type": "text", "y_mm": 235, "height_mm": 10}  # >= table.y(90)
    table = _table_element()
    table_element, repeat_elements, footer_elements = _classify_elements([header, table, totals])
    assert table_element is table
    assert repeat_elements == [header]
    assert footer_elements == [totals]


def test_footer_group_top_mm_empty_returns_none():
    assert _footer_group_top_mm([], table_bottom_mm=118) is None


def test_footer_group_top_mm_ignores_elements_that_closely_follow_the_table():
    # Totals summary sits right below the table's designed bottom (118) — within the
    # follow-threshold, so `_reflow_elements_below_table` moves it with the table; it must
    # not constrain page capacity.
    totals_box = {"type": "text", "y_mm": 121, "height_mm": 20}
    assert _footer_group_top_mm([totals_box], table_bottom_mm=118) is None


def test_footer_group_top_mm_is_the_minimum_y_among_far_elements():
    totals_box = {"type": "text", "y_mm": 121, "height_mm": 20}  # close, excluded
    bank_table = {"type": "bank-account", "slot": 1, "y_mm": 236, "height_mm": 16}  # far
    notes = {"type": "text", "y_mm": 252, "height_mm": 10}  # far
    assert _footer_group_top_mm([totals_box, bank_table, notes], table_bottom_mm=118) == 236


def test_paginate_single_page_when_items_fit():
    table = _table_element(y_mm=90, height_mm=140)
    items = _line_items(3)
    chunks = _paginate_table_rows(table, items, footer_top_mm=250, page_height_mm=297)
    assert chunks == [items]


def test_paginate_no_footer_uses_full_page_capacity():
    table = _table_element(y_mm=90, height_mm=140)
    items = _line_items(3)
    chunks = _paginate_table_rows(table, items, footer_top_mm=None, page_height_mm=297)
    assert chunks == [items]


def test_paginate_empty_line_items_returns_single_empty_chunk():
    table = _table_element()
    chunks = _paginate_table_rows(table, [], footer_top_mm=250, page_height_mm=297)
    assert chunks == [[]]


def test_paginate_splits_into_multiple_pages_without_losing_or_splitting_rows():
    # table starts near the top (y=60) with a footer fixed far down the page (y=230) —
    # mirrors a realistic invoice template: plenty of rows fit per page, footer stays put.
    table = _table_element(y_mm=60, row_height_mm=6)
    items = _line_items(80)
    chunks = _paginate_table_rows(table, items, footer_top_mm=230, page_height_mm=297)
    assert len(chunks) > 1
    assert sum(len(chunk) for chunk in chunks) == len(items)
    flattened = [row for chunk in chunks for row in chunk]
    assert flattened == items
    # The last chunk must actually contain rows (not an empty trailing page) when the
    # remainder comfortably fits within the last page's footer-constrained capacity.
    assert len(chunks[-1]) > 0


def test_paginate_last_page_has_smaller_or_equal_capacity_than_earlier_pages():
    table = _table_element(y_mm=60, row_height_mm=6)
    items = _line_items(80)
    chunks = _paginate_table_rows(table, items, footer_top_mm=230, page_height_mm=297)
    assert len(chunks) >= 2
    non_last_sizes = [len(chunk) for chunk in chunks[:-1]]
    last_size = len(chunks[-1])
    assert all(size >= last_size for size in non_last_sizes)


def test_paginate_footer_close_to_table_still_terminates_without_row_loss():
    # Pathological layout: footer sits very close to the table's top, leaving almost no
    # room on the last page. Must still terminate and never lose/duplicate a row.
    table = _table_element(y_mm=90, row_height_mm=6)
    items = _line_items(50)
    chunks = _paginate_table_rows(table, items, footer_top_mm=95, page_height_mm=297)
    assert sum(len(chunk) for chunk in chunks) == len(items)
    flattened = [row for chunk in chunks for row in chunk]
    assert flattened == items


def test_paginate_progress_guarantee_with_pathological_row_height():
    table = _table_element(y_mm=90, row_height_mm=6, row_font_size=500, header_font_size=500)
    items = _line_items(5)
    chunks = _paginate_table_rows(table, items, footer_top_mm=95, page_height_mm=297)
    assert sum(len(chunk) for chunk in chunks) == len(items)
    assert len(chunks) <= len(items) + 1
