from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Task instances.
    Provides CRUD operations and a toggle action.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    
    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        """Toggle task completion status."""
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
