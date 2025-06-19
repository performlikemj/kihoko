import React from 'react';
import { Grid, Card } from '../components/ArtCard';

const DATA = [
  { id: '1', title: 'Project One', image: 'https://placekitten.com/300/300' },
  { id: '2', title: 'Project Two', image: 'https://placekitten.com/301/301' },
  { id: '3', title: 'Project Three', image: 'https://placekitten.com/302/302' },
];

export default function PortfolioPage() {
  return (
    <Grid>
      {DATA.map((item) => (
        <Card key={item.id} item={item} />
      ))}
    </Grid>
  );
}
