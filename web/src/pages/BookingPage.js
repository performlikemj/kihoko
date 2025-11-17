import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const BookingWrapper = styled(motion.section)`
  min-height: 80vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem 4rem;
  background-color: #c8e0b8;
`;

const BookingCard = styled.div`
  width: 100%;
  max-width: 900px;
  background-color: rgba(255, 255, 255, 0.45);
  border-radius: 32px;
  padding: clamp(1.5rem, 4vw, 3rem);
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.08);
  border: 2px solid rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
`;

const Heading = styled.h1`
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

const Subheading = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const AngelIllustration = styled.div`
  position: absolute;
  inset: 1.5rem auto auto 50%;
  transform: translateX(-50%);
  font-size: clamp(2.5rem, 6vw, 3.5rem);
  font-weight: 700;
  letter-spacing: 0.3rem;
  text-transform: uppercase;
  opacity: 0.12;
  pointer-events: none;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
`;

const Input = styled.input`
  width: 100%;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.75);
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 110px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.75);
  font-size: 1rem;
  resize: vertical;
`;

const Helper = styled.p`
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.8);
  margin-top: 0.35rem;
`;

const PricingNote = styled.div`
  background-color: rgba(255, 255, 255, 0.7);
  border: 2px dashed rgba(0, 0, 0, 0.3);
  border-radius: 24px;
  padding: 1.5rem;
  margin: 2rem 0;
  line-height: 1.5;
`;

const Button = styled.button`
  align-self: flex-start;
  background-color: #111;
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.9rem 2.75rem;
  font-size: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

const FooterText = styled.p`
  font-size: 0.95rem;
  margin-top: 1.5rem;
  color: rgba(0, 0, 0, 0.85);
`;

export default function BookingPage() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body = `Theme / Idea: ${formData.get('theme') || ''}\n` +
      `Size & Reference: ${formData.get('size') || ''}\n` +
      `Placement: ${formData.get('placement') || ''}\n` +
      `Color: ${formData.get('color') || ''}\n` +
      `Preferred date & time: ${formData.get('date') || ''}\n` +
      `Anything else: ${formData.get('notes') || ''}`;

    window.location.href = `mailto:kiho@kihoko.com?subject=Tattoo Booking Request&body=${encodeURIComponent(body)}`;
  };

  return (
    <BookingWrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <BookingCard>
        <AngelIllustration>Booking Form</AngelIllustration>
        <Heading>Hi, I’m Kiho.</Heading>
        <Subheading>
          I’m based in Osaka, Japan. If you are interested in getting a tattoo from me
          please share the following details so I can start planning your piece.
        </Subheading>

        <Form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="theme">1. Theme / Idea</Label>
            <Textarea id="theme" name="theme" placeholder="Share the story, vibe, or symbols you have in mind." />
          </div>

          <div>
            <Label htmlFor="size">2. Size (send reference images if you have any)</Label>
            <Input id="size" name="size" placeholder="Approximate size or inspiration link" />
          </div>

          <div>
            <Label htmlFor="placement">3. Placement</Label>
            <Input id="placement" name="placement" placeholder="Where on your body would you like it?" />
          </div>

          <div>
            <Label htmlFor="color">4. Color</Label>
            <Input id="color" name="color" placeholder="Black & grey, color palette, or other preferences" />
          </div>

          <div>
            <Label htmlFor="date">5. Preferred date and time</Label>
            <Input id="date" name="date" placeholder="Let me know a few dates or a general timeframe" />
          </div>

          <div>
            <Label htmlFor="notes">6. Anything else you'd like to share</Label>
            <Textarea id="notes" name="notes" placeholder="Allergies, accessibility needs, references, etc." />
            <Helper>Feel free to attach reference images when you reply to my follow-up email.</Helper>
          </div>

          <Button type="submit">Send request</Button>
        </Form>

        <PricingNote>
          Pricing varies depending on size.<br />
          My minimum price starts from ¥10,000 (for a size similar to a ¥500 coin — about 3cm × 3cm).
        </PricingNote>

        <FooterText>
          Feel free to reach out if you would like a custom design. I'm flexible and happy to take your requests.
          While I won't be able to tattoo the exact same design as an existing tattoo, I will do my very best to customize
          and adjust it to match your vision.
        </FooterText>
        <FooterText>Thank you and looking forward to meeting you!</FooterText>
      </BookingCard>
    </BookingWrapper>
  );
}
