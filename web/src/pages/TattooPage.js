import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { apiService, handleApiError } from '../services/api';

/* ── Layout ─────────────────────────────────────── */
const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 2rem 1.5rem 4rem;
  max-width: 1100px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 600;
  margin: 3rem 0 1.5rem;
  letter-spacing: -0.02em;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(0,0,0,0.12);
  margin: 3rem 0;
`;

/* ── Flash Gallery ───────────────────────────────── */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
`;

const ImageCard = styled(motion.div)`
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  background: #f0f0f0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.03);
  }
`;

/* ── Booking Form ────────────────────────────────── */
const BookingCard = styled.div`
  background: rgba(255,255,255,0.6);
  border: 1.5px solid rgba(0,0,0,0.12);
  border-radius: 24px;
  padding: clamp(1.5rem, 4vw, 2.5rem);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  border: 1.5px solid rgba(0,0,0,0.2);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.8);
  font-size: 1rem;
  box-sizing: border-box;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  border: 1.5px solid rgba(0,0,0,0.2);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.8);
  font-size: 1rem;
  resize: vertical;
  box-sizing: border-box;
`;

const PricingNote = styled.p`
  font-size: 0.9rem;
  color: rgba(0,0,0,0.6);
  margin-top: 0.5rem;
`;

const SubmitButton = styled.button`
  align-self: flex-start;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.8rem 2.5rem;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  }
`;

/* ── Component ───────────────────────────────────── */
export default function TattooPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getImagesByCategory('tattoo-art')
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setImages(data);
      })
      .catch(err => console.error('Failed to load tattoo images:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body =
      `Name: ${f.get('name') || ''}\n` +
      `Theme / Idea: ${f.get('theme') || ''}\n` +
      `Size: ${f.get('size') || ''}\n` +
      `Placement: ${f.get('placement') || ''}\n` +
      `Color: ${f.get('color') || ''}\n` +
      `Preferred date: ${f.get('date') || ''}\n` +
      `Anything else: ${f.get('notes') || ''}`;
    window.location.href = `mailto:kiho@kihoko.com?subject=Tattoo Booking Request&body=${encodeURIComponent(body)}`;
  };

  return (
    <PageWrapper
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Flash / Portfolio */}
      <SectionTitle>Flash &amp; Portfolio</SectionTitle>

      {loading ? (
        <p>Loading...</p>
      ) : images.length > 0 ? (
        <Grid>
          {images.map((img, i) => (
            <ImageCard
              key={img.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <img src={img.url} alt={img.title || 'Tattoo'} loading="lazy" />
            </ImageCard>
          ))}
        </Grid>
      ) : (
        <p style={{ color: 'rgba(0,0,0,0.4)' }}>Coming soon.</p>
      )}

      <Divider />

      {/* Booking */}
      <SectionTitle>Book a Tattoo</SectionTitle>
      <p style={{ marginBottom: '1.5rem', color: 'rgba(0,0,0,0.7)' }}>
        Based in Osaka, Japan. Share the details below and I'll get back to you.
      </p>

      <BookingCard>
        <Form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Your name" />
          </div>
          <div>
            <Label htmlFor="theme">Theme / Idea</Label>
            <Textarea id="theme" name="theme" placeholder="Share the story, vibe, or symbols you have in mind." />
          </div>
          <div>
            <Label htmlFor="size">Size</Label>
            <Input id="size" name="size" placeholder="Approximate size or reference link" />
          </div>
          <div>
            <Label htmlFor="placement">Placement</Label>
            <Input id="placement" name="placement" placeholder="Where on your body?" />
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <Input id="color" name="color" placeholder="Black & grey, color, or other preferences" />
          </div>
          <div>
            <Label htmlFor="date">Preferred date &amp; time</Label>
            <Input id="date" name="date" placeholder="A few dates or general timeframe" />
          </div>
          <div>
            <Label htmlFor="notes">Anything else</Label>
            <Textarea id="notes" name="notes" placeholder="Allergies, accessibility needs, references, etc." />
          </div>
          <SubmitButton type="submit">Send Request</SubmitButton>
        </Form>

        <PricingNote>
          Pricing varies by size. Minimum starts from ¥10,000 (approx. 3cm × 3cm).
        </PricingNote>
      </BookingCard>
    </PageWrapper>
  );
}
