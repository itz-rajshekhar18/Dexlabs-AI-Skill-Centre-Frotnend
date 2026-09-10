import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type PageKey = 'school' | 'academic' | 'ai' | 'sports' | 'art' | 'admission' | 'events' | 'about';
type Section = { title: string; body: string; items?: string[]; image?: string };
type PageContent = { kicker: string; title: string; intro: string; items: string[]; sections: Section[]; cta: string; image?: string };

const pageContent: Record<PageKey, PageContent> = {
  school: {
    kicker: 'DEXLABS AI SKILL CENTRE · DABBLE COLLEGE', title: 'A new kind of learning centre.',
    intro: 'Where academics, artificial intelligence, sports, arts and future skills come together under one roof at Indira Nagar, Lucknow.',
    items: ['LEARN · Academics', 'BUILD · AI & Technology', 'PLAY · Sports', 'CREATE · Arts', 'GROW · Future Skills'],
    sections: [
      { title: 'Learning beyond the classroom.', body: 'DexLabs is designed around the belief that students need more than classroom knowledge. Our programs combine academics, physical development, creativity, technology and practical skills.', items: ['Teaching', 'Practice', 'Projects', 'Assessments', 'Technology', 'Coaching', 'Feedback', 'Performance Tracking', 'Real-World Application'] },
      { title: 'Everything in one ecosystem.', body: 'Dabble College gives students access to multiple learning opportunities within one campus, with teachers, mentors, trainers and technology working together.' },
    ], cta: 'Book a Centre Visit',
  },
  academic: {
    kicker: 'SCHOOL OF ACADEMICS', title: 'Smarter academics. Stronger foundations.',
    intro: 'Structured academic support for Classes 4 to 12, combining teacher-led learning, regular practice, modern technology and AI-powered support.',
    items: ['Classes 4–8 · Foundation', 'Classes 9–10 · Secondary', 'Classes 11–12 · Senior Secondary'],
    image: '/school-of-academics.png', sections: [
      { title: 'Foundation programme · Classes 4–8', body: 'Build strong academic fundamentals and better learning habits during the early years.', items: ['Concept Clarity', 'Homework Support', 'Subject Practice', 'Strong Fundamentals', 'Regular Assessments', 'Learning Habits', 'Confidence Building', 'AI-Assisted Learning'] },
      { title: 'Secondary programme · Classes 9–10', body: 'Concept mastery, exam preparation and consistent practice for important board years.', items: ['Board Preparation', 'Subject Support', 'Practice Tests', 'Concept Revision', 'Exam Strategy', 'Doubt Solving', 'Performance Analysis'] },
      { title: 'Senior secondary · Classes 11–12', body: 'Focused support for advanced concepts, board examinations and future academic goals.', items: ['Advanced Subject Support', 'Board Preparation', 'Practice & Testing', 'Performance Improvement', 'Academic Planning', 'Career Awareness'] },
      { title: 'AI works alongside the teacher.', body: 'Technology strengthens teaching through smart learning content, AI-based practice, personalized support, assessments and performance insights.', items: ['Learning Analytics', 'Concept Assistance', 'NEET Preparation', 'UPSC Foundation'] },
    ], cta: 'Book an Academic Counselling Session',
  },
  ai: {
    kicker: 'SCHOOL OF AI & FUTURE SKILLS', title: 'Don’t just use AI. Understand it.',
    intro: 'Learn how artificial intelligence works, how to use it responsibly and how to build with emerging technology.',
    items: ['AI Literacy', 'Prompt Engineering', 'Robotics', 'Automation', 'Digital Skills'],
    image: '/ai-future-skills.png', sections: [
      { title: 'AI is becoming a basic skill.', body: 'Students are growing up in a world where AI will shape education, careers and everyday life. Our literacy programs help them understand tools instead of using them blindly.', items: ['Introduction to AI', 'Generative AI', 'Prompt Engineering', 'AI for Academics', 'AI for Creativity', 'AI Productivity Tools', 'Responsible AI', 'AI Ethics', 'Future Careers', 'Problem Solving With AI'] },
      { title: 'Build. Code. Experiment.', body: 'The AI & Robotics program introduces technology through hands-on projects, problem solving and experimentation.', items: ['Robotics Fundamentals', 'Sensors', 'Automation', 'Programming', 'Smart Systems', 'Prototype Building', 'Logical Thinking', 'Project Development'] },
      { title: 'Future skills.', body: 'Explore the skills that prepare students for a technology-driven world.', items: ['Digital Communication', 'Content Creation', 'Entrepreneurship', 'Media Skills', 'Emerging Technology', 'Communication Skills'] },
    ], cta: 'Explore AI & Future Skills',
  },
  sports: {
    kicker: 'SCHOOL OF SPORTS', title: 'Train strong. Play smart.',
    intro: 'Structured coaching and fitness programs designed to develop physical ability, discipline and confidence.',
    items: ['Cricket', 'Basketball', 'Skating', 'MMA', 'Yoga', 'Zumba', 'Aerobics'],
    image: '/school-of-sports.png', sections: [
      { title: 'Cricket', body: 'Technical skills, fitness and match awareness through structured coaching.', items: ['Batting', 'Bowling', 'Fielding', 'Fitness', 'Match Practice', 'Technique Development'] },
      { title: 'Basketball', body: 'Movement, coordination, technique and teamwork for confident players.', items: ['Dribbling', 'Passing', 'Shooting', 'Footwork', 'Fitness', 'Team Play'] },
      { title: 'Skating · MMA · Fitness', body: 'From balance and speed to strength, conditioning, discipline and self-defence, every session makes progress visible.', items: ['Balance & Coordination', 'Technique & Safety', 'Strength & Conditioning', 'Yoga', 'Zumba', 'Aerobics'] },
    ], cta: 'Book a Trial Session',
  },
  art: {
    kicker: 'SCHOOL OF ARTS', title: 'Create. Perform. Express.',
    intro: 'A space to explore creativity, build confidence and develop practical creative skills through practice, performance and showcase.',
    items: ['Professional Music', 'Drama', 'Photography', 'Videography', 'Graphics & Media'],
    image: '/school-of-arts.png', sections: [
      { title: 'Professional music', body: 'Structured training for students interested in learning, practicing and performing music.', items: ['Vocals', 'Instruments', 'Rhythm', 'Music Theory', 'Performance', 'Stage Confidence'], image: '/professional-music.png' },
      { title: 'Drama', body: 'Performing arts that build expression, communication and stage confidence.', items: ['Acting', 'Voice', 'Expression', 'Improvisation', 'Communication', 'Stage Performance'], image: '/drama.png' },
      { title: 'Photography', body: 'Hands-on photography training for visual storytelling and creative practice.', items: ['Camera Basics', 'Composition', 'Lighting', 'Portraits', 'Editing', 'Storytelling'], image: '/photography.png' },
      { title: 'Videography', body: 'Hands-on filmmaking and video production for modern visual storytellers.', items: ['Camera Basics', 'Video Production', 'Editing', 'Storytelling', 'Sound', 'Direction'], image: '/videography.png' },
      { title: 'Graphics & media', body: 'Creative digital training focused on visual communication and modern media.', items: ['Graphic Design', 'Branding', 'Digital Creativity', 'Social Media Design', 'Media Production'], image: '/graphics-media.png' },
    ], cta: 'Explore Arts',
  },
  admission: {
    kicker: 'ADMISSIONS', title: 'Find the right skill. Start the journey.',
    intro: 'Every student has different interests and goals. Our process helps families explore programs before choosing the right learning journey.',
    items: ['01 · Choose a category', '02 · Select a programme', '03 · Counselling or trial', '04 · Choose a batch', '05 · Complete admission'],
    sections: [
      { title: 'Experience the centre before you decide.', body: 'Visit Dabble College, meet our team and explore the learning environments available at DexLabs. A centre visit helps families understand the programs, facilities and approach.' },
      { title: 'Start by understanding your AI awareness.', body: 'Students can take the DexLabs AI IQ Test to understand their current knowledge of artificial intelligence and identify areas to improve.', items: ['Take DexTest', 'Book a Centre Visit', 'Book a Trial', 'Admission Enquiry'] },
    ], cta: 'Start Your Dabble Journey',
  },
  events: {
    kicker: 'EVENTS AT DABBLE', title: 'Something is always happening.',
    intro: 'Workshops, competitions, performances, sports activities and community events bring students together at DexLabs AI Skill Centre.',
    items: ['AI Workshops', 'Sports Competitions', 'Creative Events', 'Academic Workshops', 'Festivals & Celebrations', 'Student Challenges'],
    sections: [
      { title: 'Learn together. Make it real.', body: 'Every event is an invitation to participate, perform, create and innovate.', items: ['AI tools & applications', 'Friendly sports activities', 'Music, media & performance', 'Academic development', 'Community celebrations', 'Skill challenges'] },
    ], cta: 'View Upcoming Events',
  },
  about: {
    kicker: 'ABOUT DEXLABS AI EDUCATION', title: 'Building the future of learning.',
    intro: 'DexLabs AI Education is building a complete ecosystem for students, teachers, parents and educational institutions preparing for an AI-powered future.',
    items: ['Learn', 'Play', 'Create', 'Innovate'],
    sections: [
      { title: 'AI education for the complete school ecosystem.', body: 'We develop AI-powered learning tools, education technology, AI literacy programs and physical learning centres for students, teachers, parents, schools and learning centres.' },
      { title: 'Where the ecosystem comes to life.', body: 'Dabble College is the physical DexLabs AI Skill Centre in Indira Nagar, Lucknow. It brings academics, AI, robotics, sports, arts and future-oriented skill development into one integrated learning hub.' },
      { title: 'Our vision & mission.', body: 'We envision learning environments where students develop academically, technologically, physically and creatively. Our mission is to make quality academics, AI education, professional training, creative development and future-ready skills accessible within one ecosystem.' },
      { title: 'Powered by DexLabs AI Education.', body: 'DexBro supports student learning and creativity. DexGuru supports teachers. DexChapter enables chapter-wise learning. DexTest brings assessment insights. Dex-I supports smarter campus safety and monitoring.' },
    ], cta: 'Explore the Skill Centre',
  },
};

@Component({ selector: 'app-site-page', standalone: true, imports: [RouterLink], templateUrl: './site-page.html', styleUrl: './site-page.css' })
export class SitePage implements OnInit, OnDestroy {
  protected readonly isNight = signal(false);
  protected readonly nav = [
    { key: 'school', path: '/school', label: 'School' }, { key: 'academic', path: '/academic', label: 'Academic' }, { key: 'ai', path: '/ai', label: 'AI + Skills' },
    { key: 'sports', path: '/sports', label: 'Sports' }, { key: 'art', path: '/art', label: 'Art' }, { key: 'admission', path: '/admission', label: 'Admission' }, { key: 'events', path: '/events', label: 'Events' }, { key: 'about', path: '/about', label: 'About' },
  ];
  protected key: PageKey = 'about';
  protected content = pageContent.about;
  private clock?: ReturnType<typeof setInterval>;
  constructor(route: ActivatedRoute) { const key = route.snapshot.data['page'] as PageKey; this.key = key; this.content = pageContent[key]; }
  ngOnInit(): void { this.updateTheme(); this.clock = setInterval(() => this.updateTheme(), 60_000); }
  ngOnDestroy(): void { if (this.clock) clearInterval(this.clock); }
  private updateTheme(): void { const hour = new Date().getHours(); this.isNight.set(hour >= 18 || hour < 6); }
}
