import { Button } from '../ui/Button'
import { Calendar } from 'lucide-react'

export function CTA() {
    return (
        <section className="py-32 bg-primary text-white relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-display font-medium mb-6">Ready to Begin?</h2>
                <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                    Join our welcoming community and start your yoga journey today
                </p>
                <Button variant="white" size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-base font-semibold shadow-lg">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Your First Class
                </Button>
            </div>
        </section>
    )
}
