from django.db import models


class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    settings = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.username

    class Meta:
        ordering = ['-created_at']

