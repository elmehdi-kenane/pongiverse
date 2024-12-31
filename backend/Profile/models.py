from django.db import models
from myapp.models import customuser

# Create your models here.
class UserTFQ(models.Model):
    user = models.ForeignKey(customuser, on_delete=models.CASCADE, related_name='user_tfq')
    key = models.CharField(max_length=200)
    qr_code = models.ImageField(upload_to='uploads/qr_codes/', blank=True, null=True)

class UserReports(models.Model):
    reporter = models.ForeignKey(customuser, on_delete=models.CASCADE, related_name='reporter')
    reported = models.ForeignKey(customuser, on_delete=models.CASCADE, related_name='reported')
    report_message = models.CharField(max_length=100)