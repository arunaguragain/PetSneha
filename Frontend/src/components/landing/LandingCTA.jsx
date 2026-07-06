import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../ui';

export default function LandingCTA() {
  return (
    <section className="container-app py-6 md:py-10">
      <Card className="rounded-[2rem] bg-primary-600 px-6 py-14 text-center text-white shadow-lift md:px-10">
        <h2 className="text-heading-lg font-display text-white sm:text-heading-xl">Ready to give your pet better care?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-body-md text-white/80">
          Join thousands of pet parents who have already simplified their pet care routine. It's free to get started.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/register">
            <Button variant="white" className="!rounded-full min-w-52">Create account</Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
