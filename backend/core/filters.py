from django_filters import rest_framework as filters
from .models import AuditLog

class AuditLogFilter(filters.FilterSet):
    from_date = filters.IsoDateTimeFilter(field_name="timestamp", lookup_expr='gte')
    to_date = filters.IsoDateTimeFilter(field_name="timestamp", lookup_expr='lte')
    
 
    user = filters.CharFilter(field_name="user__username", lookup_expr='icontains')

    class Meta:
        model = AuditLog
        fields = ['status'] 