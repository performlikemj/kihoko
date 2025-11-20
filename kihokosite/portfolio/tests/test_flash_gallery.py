from django.test import TestCase
from django.urls import reverse

from portfolio.models import FlashDesign


class FlashGalleryViewTests(TestCase):
    def setUp(self):
        self.available = FlashDesign.objects.create(
            title="Lotus Bloom",
            image_blob="flash/lotus.jpg",
            is_available=True,
            order=1,
        )
        self.taken = FlashDesign.objects.create(
            title="Koi Embrace",
            image_blob="flash/koi.jpg",
            is_available=False,
            order=2,
        )

    def test_flash_gallery_renders_designs_in_order(self):
        response = self.client.get(reverse('flash_gallery'))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'flash_gallery.html')
        designs = list(response.context['flash_designs'])
        self.assertEqual(designs, [self.available, self.taken])

    def test_flash_gallery_shows_availability_counts(self):
        response = self.client.get(reverse('flash_gallery'))

        self.assertEqual(response.context['available_count'], 1)
        self.assertEqual(response.context['taken_count'], 1)
