import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-testimonial',
  imports: [],
  templateUrl: './testimonial.html',
  styleUrl: './testimonial.scss',
})
export class Testimonial {
  @Input() testimonials = [
    {
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      title: 'Amazing Service',
      description:
        'I loved using this product! It truly exceeded my expectations.',
      rating: 5,
      author: 'John Doe',
    },
    {
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      title: 'Highly recommended',
      description: 'Excellent experience from start to finish.',
      rating: 4,
      author: 'Jane Smith',
    },
    // Add more testimonials here
  ];
}
