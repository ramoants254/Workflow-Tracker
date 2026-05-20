import json
from django.test import TestCase, Client
from .models import Application


class ApplicationAPITests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_create_and_full_workflow(self):
        """Test full workflow: create -> submit -> review -> decide"""
        # Create draft
        payload = {
            'applicant_name': 'Alice Smith',
            'applicant_email': 'alice@example.com',
            'company_name': 'Acme Corp',
            'application_type': 'Recordation',
            'description': 'Test application',
        }
        resp = self.client.post('/api/applications/', 
                              data=json.dumps(payload), 
                              content_type='application/json')
        self.assertEqual(resp.status_code, 201, f"Create failed: {resp.content}")
        data = resp.json()
        tn = data['tracking_number']
        self.assertEqual(data['status'], 'Draft')

        # Update draft
        resp = self.client.patch(f'/api/applications/{tn}/', 
                               data=json.dumps({'description': 'Updated description'}), 
                               content_type='application/json')
        self.assertEqual(resp.status_code, 200, f"Update failed: {resp.content}")
        self.assertEqual(resp.json()['description'], 'Updated description')

        # Submit
        resp = self.client.post(f'/api/applications/{tn}/submit')
        self.assertEqual(resp.status_code, 200, f"Submit failed: {resp.content}")
        self.assertEqual(resp.json()['status'], 'Submitted')

        # Start review
        resp = self.client.post(f'/api/applications/{tn}/start-review')
        self.assertEqual(resp.status_code, 200, f"Start review failed: {resp.content}")
        self.assertEqual(resp.json()['status'], 'Under Review')

        # Approve
        resp = self.client.post(f'/api/applications/{tn}/decision', 
                              data=json.dumps({'decision': 'approved', 'comment': 'Looks good'}), 
                              content_type='application/json')
        self.assertEqual(resp.status_code, 200, f"Approve failed: {resp.content}")
        self.assertEqual(resp.json()['status'], 'Approved')

    def test_need_more_info_flow(self):
        """Test need more information workflow"""
        # Create and submit
        app = Application.objects.create(
            applicant_name='Bob Johnson',
            applicant_email='bob@example.com',
            company_name='Widgets Inc',
            application_type='Renewal',
            status=Application.Status.UNDER_REVIEW,
        )
        tn = app.tracking_number

        # Decide: need more info without comment should fail
        resp = self.client.post(f'/api/applications/{tn}/decision', 
                              data=json.dumps({'decision': 'need_more_info'}), 
                              content_type='application/json')
        self.assertEqual(resp.status_code, 400, f"Should fail without comment: {resp.content}")

        # Decide: need more info with comment
        resp = self.client.post(f'/api/applications/{tn}/decision', 
                              data=json.dumps({'decision': 'need_more_info', 'comment': 'Need docs'}), 
                              content_type='application/json')
        self.assertEqual(resp.status_code, 200, f"Need more info failed: {resp.content}")
        self.assertEqual(resp.json()['status'], 'Need More Information')

        # Can now edit
        resp = self.client.patch(f'/api/applications/{tn}/', 
                               data=json.dumps({'description': 'Resubmitted with docs'}), 
                               content_type='application/json')
        self.assertEqual(resp.status_code, 200, f"Edit after need more info failed: {resp.content}")

        # Resubmit
        resp = self.client.post(f'/api/applications/{tn}/submit')
        self.assertEqual(resp.status_code, 200, f"Resubmit failed: {resp.content}")
        self.assertEqual(resp.json()['status'], 'Submitted')

    def test_reject_flow(self):
        """Test rejection workflow"""
        app = Application.objects.create(
            applicant_name='Carol Davis',
            applicant_email='carol@example.com',
            company_name='Tech LLC',
            application_type='Change of Name',
            status=Application.Status.UNDER_REVIEW,
        )
        tn = app.tracking_number

        # Reject without comment should fail
        resp = self.client.post(f'/api/applications/{tn}/decision', 
                              data=json.dumps({'decision': 'rejected'}), 
                              content_type='application/json')
        self.assertEqual(resp.status_code, 400, f"Should fail without comment: {resp.content}")

        # Reject with comment
        resp = self.client.post(f'/api/applications/{tn}/decision', 
                              data=json.dumps({'decision': 'rejected', 'comment': 'Missing signatures'}), 
                              content_type='application/json')
        self.assertEqual(resp.status_code, 200, f"Reject failed: {resp.content}")
        self.assertEqual(resp.json()['status'], 'Rejected')

    def test_invalid_transitions(self):
        """Test invalid workflow transitions"""
        app = Application.objects.create(
            applicant_name='David Wilson',
            applicant_email='david@example.com',
            company_name='BuildCo',
            application_type='Discontinuation',
        )
        tn = app.tracking_number

        # Cannot start review from Draft
        resp = self.client.post(f'/api/applications/{tn}/start-review')
        self.assertEqual(resp.status_code, 400, f"Should not allow start-review from Draft: {resp.content}")

        # Submit
        resp = self.client.post(f'/api/applications/{tn}/submit')
        self.assertEqual(resp.status_code, 200)

        # Cannot edit after submitted
        resp = self.client.patch(f'/api/applications/{tn}/', 
                               data=json.dumps({'description': 'x'}), 
                               content_type='application/json')
        self.assertEqual(resp.status_code, 400, f"Should not allow edit after submit: {resp.content}")

    def test_list_and_detail(self):
        """Test list and detail endpoints"""
        # Create some applications
        for i in range(3):
            Application.objects.create(
                applicant_name=f'User {i}',
                applicant_email=f'user{i}@example.com',
                company_name=f'Company {i}',
                application_type='Recordation',
            )

        # List all
        resp = self.client.get('/api/applications/')
        self.assertEqual(resp.status_code, 200, f"List failed: {resp.content}")
        data = resp.json()
        self.assertEqual(len(data), 3)

        # Get first one
        tn = data[0]['tracking_number']
        resp = self.client.get(f'/api/applications/{tn}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['tracking_number'], tn)
