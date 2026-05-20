from ninja import Router, Schema
from ninja.errors import HttpError
from typing import Optional, List
from pydantic import EmailStr
from django.utils import timezone

from .models import Application

api_router = Router()


class ApplicationCreate(Schema):
    applicant_name: str
    applicant_email: EmailStr
    company_name: str
    application_type: str
    description: Optional[str] = None


class ApplicationUpdate(Schema):
    applicant_name: Optional[str] = None
    applicant_email: Optional[EmailStr] = None
    company_name: Optional[str] = None
    application_type: Optional[str] = None
    description: Optional[str] = None


class DecisionSchema(Schema):
    decision: str
    comment: Optional[str] = None


def to_dict(obj: Application) -> dict:
    return {
        'tracking_number': obj.tracking_number,
        'applicant_name': obj.applicant_name,
        'applicant_email': obj.applicant_email,
        'company_name': obj.company_name,
        'application_type': obj.application_type,
        'description': obj.description,
        'status': obj.status,
        'reviewer_comment': obj.reviewer_comment,
        'created_at': obj.created_at,
        'updated_at': obj.updated_at,
        'submitted_at': obj.submitted_at,
        'reviewed_at': obj.reviewed_at,
    }


@api_router.get('/health')
def health(request):
    return {'status': 'ok'}


@api_router.post('/', response={201: dict})
def create_application(request, payload: ApplicationCreate):
    app = Application.objects.create(
        applicant_name=payload.applicant_name,
        applicant_email=payload.applicant_email,
        company_name=payload.company_name,
        application_type=payload.application_type,
        description=payload.description or '',
        status=Application.Status.DRAFT,
    )
    return to_dict(app)


@api_router.get('/', response=List[dict])
def list_applications(request):
    qs = Application.objects.all().order_by('-created_at')
    return [to_dict(o) for o in qs]


@api_router.get('/{tracking_number}/')
def get_application(request, tracking_number: str):
    try:
        app = Application.objects.get(tracking_number=tracking_number)
    except Application.DoesNotExist:
        raise HttpError(404, 'Not found')
    return to_dict(app)


@api_router.patch('/{tracking_number}/')
def update_application(request, tracking_number: str, payload: ApplicationUpdate):
    try:
        app = Application.objects.get(tracking_number=tracking_number)
    except Application.DoesNotExist:
        raise HttpError(404, 'Not found')

    # Only Draft or Need More Information can be edited
    if app.status not in (Application.Status.DRAFT, Application.Status.NEED_MORE_INFORMATION):
        raise HttpError(400, 'Only Draft or Need More Information applications can be edited')

    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(app, k, v)
    app.save()
    return to_dict(app)


@api_router.post('/{tracking_number}/submit')
def submit_application(request, tracking_number: str):
    try:
        app = Application.objects.get(tracking_number=tracking_number)
    except Application.DoesNotExist:
        raise HttpError(404, 'Not found')

    # Allow submit from Draft or Need More Information (resubmission)
    if app.status not in (Application.Status.DRAFT, Application.Status.NEED_MORE_INFORMATION):
        raise HttpError(400, 'Only Draft or Need More Information applications can be submitted')

    app.status = Application.Status.SUBMITTED
    app.submitted_at = timezone.now()
    app.save()
    return to_dict(app)


@api_router.post('/{tracking_number}/start-review')
def start_review(request, tracking_number: str):
    try:
        app = Application.objects.get(tracking_number=tracking_number)
    except Application.DoesNotExist:
        raise HttpError(404, 'Not found')

    if app.status != Application.Status.SUBMITTED:
        raise HttpError(400, 'Only Submitted applications can move to Under Review')

    app.status = Application.Status.UNDER_REVIEW
    app.save()
    return to_dict(app)


@api_router.post('/{tracking_number}/decision')
def decision(request, tracking_number: str, payload: DecisionSchema):
    try:
        app = Application.objects.get(tracking_number=tracking_number)
    except Application.DoesNotExist:
        raise HttpError(404, 'Not found')

    if app.status != Application.Status.UNDER_REVIEW:
        raise HttpError(400, 'Only Under Review applications can receive a reviewer decision')

    decision = payload.decision.lower()
    comment = payload.comment or ''

    if decision == 'approved':
        app.status = Application.Status.APPROVED
        app.reviewer_comment = comment
        app.reviewed_at = timezone.now()
    elif decision == 'rejected':
        if not comment:
            raise HttpError(400, 'Reviewer comment required for Rejected')
        app.status = Application.Status.REJECTED
        app.reviewer_comment = comment
        app.reviewed_at = timezone.now()
    elif decision in ('need_more_information', 'need more information') or decision == 'need_more_info':
        if not comment:
            raise HttpError(400, 'Reviewer comment required for Need More Information')
        app.status = Application.Status.NEED_MORE_INFORMATION
        app.reviewer_comment = comment
        app.reviewed_at = timezone.now()
    else:
        raise HttpError(400, 'Invalid decision')

    app.save()
    return to_dict(app)
