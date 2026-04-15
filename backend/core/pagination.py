from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
import math

from rest_framework.pagination import CursorPagination

class AuditLogPagination(CursorPagination):
    page_size = 50
    ordering = "-timestamp"

class CustomContactsPagination(PageNumberPagination):
    page_size = 25
    max_page_size = 100

    def get_paginated_response(self, data):
        total_pages = math.ceil(self.page.paginator.count / self.page_size)
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            "total_pages": total_pages,
            "current_page": self.page.number,
        })
    
class MembersPagination(PageNumberPagination):
    page_size = 30

    def get_paginated_response(self, data):

        total_pages = math.ceil(self.page.paginator.count / self.page_size)

        return Response({
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "total_pages": total_pages,
            "current_page": self.page.number,
            "results": data,
        })

class ImportPagination(PageNumberPagination):
    page_size = 25

    def get_paginated_response(self, data):

        total_pages = math.ceil(self.page.paginator.count / self.page_size)

        return Response({
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "total_pages": total_pages,
            "current_page": self.page.number,
            "results": data,
        })

class ImportPreviewPagination(PageNumberPagination):
    max_page_size = 100
    page_size = 50
    page_size_query_param = 'page_size'

    def get_paginated_response(self, data):
        session = self.request._import_session
        total_pages = math.ceil(self.page.paginator.count / self.page_size)

        return Response({
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "total_pages": total_pages,
            "current_page": self.page.number,
            "meta": {
                "valid_rows": session.valid_rows,
                "invalid_rows": session.invalid_rows,
            },
            "results": data,
        })
