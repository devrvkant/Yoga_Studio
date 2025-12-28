import { Button } from '../ui/Button'
import { CalendarDays, Bot, ArrowDown } from 'lucide-react'
import heroImg from '../../assets/images/hero.jpg'

export function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Peaceful Yoga Studio"
          className="w-full h-full object-cover"
        />
        {/* No overlay - bright image as in design */}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center pt-20">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium text-foreground leading-[1.1] mb-4 italic">
          Find Your Inner Peace
        </h1>
        <p className="text-xl md:text-2xl text-foreground mb-10 font-medium drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
          Begin Your Yoga Journey Today
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            size="lg"
            className="rounded-full text-base px-8 h-12 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-primary hover:bg-primary-dark text-white gap-2 border-0"
          >
            <CalendarDays size={18} />
            Book a Class
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full text-base px-8 h-12 border-2 border-primary text-primary hover:bg-primary hover:text-white bg-transparent transition-all duration-300"
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center animate-bounce">
        <ArrowDown size={24} className="text-primary" />
      </div>

      {/* Talk with Us Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="flex items-center gap-2 bg-[#3d4f5f] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-[#4a5f6f] hover:-translate-y-0.5 transition-all duration-300 border-0 cursor-pointer">
          <Bot size={18} />
          <span className="text-sm font-medium">Talk with Us</span>
        </button>
      </div>
    </section>
  )
}
