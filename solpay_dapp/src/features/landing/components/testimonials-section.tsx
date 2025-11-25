
import { testimonials } from '../landing-page.data';

export function TestimonialsSection() {
  return (
    <section className="px-6 pb-24 md:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.35em] text-primary-200">Proof from operators</p>
        <h2 className="mt-3 text-3xl font-semibold">Loved by teams who move money at scale.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="rounded-[32px] border border-white/5 bg-gradient-to-b from-white/10 to-white/5 p-8 text-left">
              <p className="text-lg text-white/90">“{testimonial.quote}”</p>
              <p className="mt-6 text-sm uppercase tracking-[0.3em] text-white/60">{testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
