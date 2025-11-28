import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Zap, TrendingUp, Award } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Video SaaS</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Create AI-Powered Videos
            <br />
            <span className="text-primary">Grow Your Reach Virally</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your ideas into stunning videos with AI. Invite friends and unlock premium features while earning rewards.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg">
                View Dashboard
              </Button>
            </Link>
          </div>
        </section>

        <section className="bg-muted py-24">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">
              Viral Growth Features
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold">Referral System</h4>
                <p className="text-muted-foreground">
                  Earn 100 credits for every friend who signs up with your unique code
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold">Instant Rewards</h4>
                <p className="text-muted-foreground">
                  Get credits for sharing, inviting, and engaging with the platform
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold">Viral Loops</h4>
                <p className="text-muted-foreground">
                  Unlock premium features by referring just 3 friends
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold">Leaderboards</h4>
                <p className="text-muted-foreground">
                  Compete for the top spot and earn exclusive tier rewards
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24 text-center">
          <h3 className="text-3xl font-bold mb-6">
            Ready to Go Viral?
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users creating amazing content and growing together.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 AI Video SaaS. Built with viral marketing in mind.</p>
        </div>
      </footer>
    </div>
  )
}
