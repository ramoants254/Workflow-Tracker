import uuid
from django.db import models


class Application(models.Model):
    class ApplicationType(models.TextChoices):
        RECORDATION = 'Recordation'
        RENEWAL = 'Renewal'
        CHANGE_OF_OWNERSHIP = 'Change of Ownership'
        CHANGE_OF_NAME = 'Change of Name'
        DISCONTINUATION = 'Discontinuation'

    class Status(models.TextChoices):
        DRAFT = 'Draft'
        SUBMITTED = 'Submitted'
        UNDER_REVIEW = 'Under Review'
        NEED_MORE_INFORMATION = 'Need More Information'
        APPROVED = 'Approved'
        REJECTED = 'Rejected'

    tracking_number = models.CharField(max_length=64, unique=True, editable=False)
    applicant_name = models.CharField(max_length=255)
    applicant_email = models.EmailField()
    company_name = models.CharField(max_length=255)
    application_type = models.CharField(max_length=50, choices=ApplicationType.choices)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.DRAFT)
    reviewer_comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.tracking_number:
            # short unique tracking number
            self.tracking_number = f"APP-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.tracking_number
