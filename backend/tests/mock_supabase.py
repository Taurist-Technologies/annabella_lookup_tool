from unittest.mock import MagicMock


class MockTable:
    def __init__(self):
        self.data = []

    def select(self, *args, **kwargs):
        return self

    def eq(self, field, value):
        if field == "abbreviation" and value == "XX":
            self.data = []
        elif field == "abbreviation":
            self.data = [{"abbreviation": value}]
        return self

    def contains(self, *args, **kwargs):
        return self

    def in_(self, *args, **kwargs):
        return self

    def execute(self):
        return MagicMock(data=self.data)

    def insert(self, data):
        if isinstance(data, list):
            self.data = data
            return self
        else:
            self.data = [data]
            return self


class MockSupabase:
    def __init__(self):
        self._tables = {}

    def table(self, name):
        if name not in self._tables:
            self._tables[name] = MockTable()
        return self._tables[name]


supabase = MockSupabase()
