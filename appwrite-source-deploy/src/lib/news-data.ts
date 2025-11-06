import { NewsArticle, PROVINCES } from "./news-types";

// Mock news data - This can be replaced with real API calls
// In production, this would come from a news API like NewsAPI.org or similar
export const mockNewsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Gauteng Department of Education Announces New Digital Learning Initiative",
    description: "The Gauteng Education Department has launched a comprehensive digital learning platform to support students across the province.",
    content: "The Gauteng Department of Education has announced a new digital learning initiative aimed at improving access to quality education. The platform will provide online resources, virtual classrooms, and interactive learning materials for students from Grade R to Grade 12. Education MEC Panyaza Lesufi stated that this initiative will help bridge the digital divide and ensure all learners have access to modern educational tools.",
    province: "Gauteng",
    source: "Gauteng Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    category: "school",
    tags: ["digital learning", "technology", "education"],
  },
  {
    id: "2",
    title: "UCT Launches New Engineering Scholarship Program",
    description: "The University of Cape Town announces scholarship opportunities for engineering students from disadvantaged backgrounds.",
    content: "The University of Cape Town has launched a new scholarship program specifically designed to support engineering students from disadvantaged backgrounds. The program will provide full tuition coverage, accommodation, and living allowances for 50 students annually. Applications open next month.",
    province: "Western Cape",
    source: "University of Cape Town",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    category: "university",
    tags: ["scholarships", "engineering", "UCT"],
  },
  {
    id: "3",
    title: "KZN Schools to Implement New Mathematics Curriculum",
    description: "KwaZulu-Natal schools will begin implementing an updated mathematics curriculum focusing on practical problem-solving skills.",
    content: "The KwaZulu-Natal Department of Education has announced that all schools in the province will begin implementing a new mathematics curriculum starting next term. The updated curriculum emphasizes practical problem-solving skills and real-world applications of mathematical concepts.",
    province: "KwaZulu-Natal",
    source: "KZN Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    category: "school",
    tags: ["curriculum", "mathematics", "KZN"],
  },
  {
    id: "4",
    title: "Wits University Partners with International Tech Companies",
    description: "The University of the Witwatersrand announces partnerships with leading tech companies to enhance student training programs.",
    content: "The University of the Witwatersrand has formed strategic partnerships with several international technology companies to enhance its student training programs. These partnerships will provide students with access to cutting-edge technology, internships, and job placement opportunities in the tech sector.",
    province: "Gauteng",
    source: "Wits University",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    category: "university",
    tags: ["partnerships", "technology", "Wits"],
  },
  {
    id: "5",
    title: "Eastern Cape Schools Receive Infrastructure Upgrade Funding",
    description: "The Eastern Cape Department of Education allocates R500 million for school infrastructure improvements.",
    content: "The Eastern Cape Department of Education has allocated R500 million for school infrastructure improvements across the province. The funding will be used to build new classrooms, upgrade existing facilities, improve sanitation, and install solar power systems in rural schools.",
    province: "Eastern Cape",
    source: "Eastern Cape Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    category: "school",
    tags: ["infrastructure", "funding", "Eastern Cape"],
  },
  {
    id: "6",
    title: "Free State University Expands Online Learning Options",
    description: "The University of the Free State announces expansion of its online learning programs to reach more students.",
    content: "The University of the Free State has announced a significant expansion of its online learning programs. The university will now offer fully online degrees in business, education, and health sciences, making higher education more accessible to students who cannot attend on-campus classes.",
    province: "Free State",
    source: "UFS",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    category: "university",
    tags: ["online learning", "UFS", "distance education"],
  },
  {
    id: "7",
    title: "Limpopo Schools Implement Nutrition Program",
    description: "A new school nutrition program launched in Limpopo to ensure all learners receive nutritious meals.",
    content: "The Limpopo Department of Education has launched a comprehensive school nutrition program that will ensure all learners receive nutritious meals during school hours. The program aims to improve learner concentration, attendance, and overall academic performance.",
    province: "Limpopo",
    source: "Limpopo Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    category: "school",
    tags: ["nutrition", "wellness", "Limpopo"],
  },
  {
    id: "8",
    title: "North West Province Launches Teacher Training Initiative",
    description: "The North West Department of Education announces new training programs for teachers to improve classroom outcomes.",
    content: "The North West Department of Education has launched a new teacher training initiative focused on modern teaching methodologies and curriculum delivery. The program will train over 1,000 teachers across the province in the next academic year.",
    province: "North West",
    source: "North West Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    category: "school",
    tags: ["teacher training", "professional development", "North West"],
  },
  {
    id: "9",
    title: "Mpumalanga Schools Get Library Upgrades",
    description: "Mpumalanga Department of Education invests in upgrading school libraries across the province.",
    content: "The Mpumalanga Department of Education has announced a comprehensive library upgrade program. The initiative will modernize school libraries with new books, digital resources, and improved facilities to encourage reading and research among students.",
    province: "Mpumalanga",
    source: "Mpumalanga Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
    category: "school",
    tags: ["libraries", "literacy", "Mpumalanga"],
  },
  {
    id: "10",
    title: "Northern Cape University Announces Research Grants",
    description: "Northern Cape university announces new research grant opportunities for postgraduate students.",
    content: "A Northern Cape university has announced new research grant opportunities worth R10 million for postgraduate students. The grants will support research in areas such as renewable energy, agriculture, and water resource management.",
    province: "Northern Cape",
    source: "Northern Cape Higher Education",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    category: "university",
    tags: ["research", "grants", "Northern Cape"],
  },
  {
    id: "11",
    title: "Western Cape Schools Excel in National Assessments",
    description: "Western Cape schools achieve top results in the latest national assessment tests.",
    content: "Western Cape schools have achieved top results in the latest national assessment tests, with the province maintaining its position as a top performer. Education officials attribute the success to strong teacher training programs and effective use of technology in classrooms.",
    province: "Western Cape",
    source: "Western Cape Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), // 11 days ago
    category: "school",
    tags: ["assessments", "performance", "Western Cape"],
  },
  {
    id: "12",
    title: "Stellenbosch University Opens New Science Labs",
    description: "Stellenbosch University officially opens state-of-the-art science laboratories for research and teaching.",
    content: "Stellenbosch University has officially opened new state-of-the-art science laboratories worth R50 million. The facilities will support cutting-edge research in chemistry, physics, and biology, providing students with world-class equipment and learning environments.",
    province: "Western Cape",
    source: "Stellenbosch University",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    category: "university",
    tags: ["science", "laboratories", "Stellenbosch"],
  },
  // Additional Eastern Cape articles
  {
    id: "13",
    title: "Nelson Mandela University Introduces Coding Bootcamp for High School Students",
    description: "NMU launches free coding bootcamp program to introduce high school learners to computer programming.",
    content: "Nelson Mandela University has launched a free coding bootcamp program specifically designed for high school students in the Eastern Cape. The intensive 8-week program will teach Python programming, web development, and basic algorithms, preparing students for careers in technology.",
    province: "Eastern Cape",
    source: "Nelson Mandela University",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    category: "university",
    tags: ["coding", "technology", "programming", "NMU"],
  },
  {
    id: "14",
    title: "Eastern Cape Rural Schools Get Solar Power Installation",
    description: "50 rural schools in Eastern Cape receive solar power systems to improve learning conditions.",
    content: "The Eastern Cape Department of Education has completed the installation of solar power systems in 50 rural schools across the province. This initiative will ensure consistent electricity supply, enabling schools to use computers, projectors, and other electronic learning tools.",
    province: "Eastern Cape",
    source: "Eastern Cape Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    category: "school",
    tags: ["solar power", "infrastructure", "rural schools"],
  },
  // Additional Free State articles
  {
    id: "15",
    title: "Free State Schools Adopt New Reading Program",
    description: "A province-wide reading program aims to improve literacy rates among primary school learners.",
    content: "The Free State Department of Education has launched a comprehensive reading program targeting all primary schools in the province. The program includes reading materials in multiple languages, teacher training workshops, and reading competitions to encourage a love of reading among young learners.",
    province: "Free State",
    source: "Free State Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    category: "school",
    tags: ["literacy", "reading", "primary education"],
  },
  {
    id: "16",
    title: "UFS Medical School Receives International Accreditation",
    description: "The University of the Free State's medical school achieves prestigious international accreditation.",
    content: "The University of the Free State's Faculty of Health Sciences has received full international accreditation from the World Federation for Medical Education. This recognition confirms the medical school's commitment to excellence and opens opportunities for student exchange programs.",
    province: "Free State",
    source: "UFS",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    category: "university",
    tags: ["medical school", "accreditation", "UFS"],
  },
  // Additional Gauteng articles
  {
    id: "17",
    title: "Gauteng Schools Pilot New CAPS Assessment Tool",
    description: "50 Gauteng schools testing innovative digital assessment platform aligned with CAPS curriculum.",
    content: "The Gauteng Department of Education has selected 50 schools to pilot a new digital assessment platform that aligns perfectly with the CAPS curriculum. The tool allows teachers to create, administer, and grade assessments digitally while providing instant feedback to students and parents.",
    province: "Gauteng",
    source: "Gauteng Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    category: "school",
    tags: ["assessment", "CAPS", "digital tools"],
  },
  {
    id: "18",
    title: "University of Johannesburg Launches Entrepreneurship Hub",
    description: "UJ opens new center to support student entrepreneurs and startups.",
    content: "The University of Johannesburg has launched a state-of-the-art entrepreneurship hub designed to support student entrepreneurs and startups. The hub provides co-working spaces, mentorship programs, seed funding opportunities, and connections to investors and industry partners.",
    province: "Gauteng",
    source: "University of Johannesburg",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    category: "university",
    tags: ["entrepreneurship", "innovation", "UJ"],
  },
  // Additional KwaZulu-Natal articles
  {
    id: "19",
    title: "UKZN Launches Marine Biology Research Center",
    description: "University of KwaZulu-Natal opens new research facility focused on marine ecosystems.",
    content: "The University of KwaZulu-Natal has officially opened a new marine biology research center in Durban. The facility will focus on studying South Africa's coastal ecosystems, providing research opportunities for students and contributing to marine conservation efforts.",
    province: "KwaZulu-Natal",
    source: "UKZN",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    category: "university",
    tags: ["marine biology", "research", "UKZN"],
  },
  {
    id: "20",
    title: "KZN Schools Implement Bilingual Education Program",
    description: "New program promotes learning in both English and isiZulu across KwaZulu-Natal schools.",
    content: "The KwaZulu-Natal Department of Education has launched a bilingual education program that promotes learning in both English and isiZulu. The initiative aims to preserve cultural heritage while ensuring learners are proficient in both languages, improving overall academic performance.",
    province: "KwaZulu-Natal",
    source: "KZN Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    category: "school",
    tags: ["bilingual", "language", "cultural heritage"],
  },
  // Additional Limpopo articles
  {
    id: "21",
    title: "Limpopo Schools Get Computer Lab Upgrades",
    description: "100 schools in Limpopo receive new computers and internet connectivity.",
    content: "The Limpopo Department of Education has completed the installation of new computer laboratories in 100 schools across the province. Each lab includes 30 computers, high-speed internet connectivity, and educational software aligned with the CAPS curriculum.",
    province: "Limpopo",
    source: "Limpopo Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    category: "school",
    tags: ["technology", "computer labs", "digital literacy"],
  },
  {
    id: "22",
    title: "University of Limpopo Expands Agricultural Sciences Program",
    description: "UL introduces new courses in sustainable agriculture and food security.",
    content: "The University of Limpopo has expanded its agricultural sciences program with new courses focused on sustainable agriculture and food security. The expanded program includes partnerships with local farming communities, providing hands-on experience for students while supporting local food production.",
    province: "Limpopo",
    source: "University of Limpopo",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
    category: "university",
    tags: ["agriculture", "sustainability", "food security"],
  },
  // Additional Mpumalanga articles
  {
    id: "23",
    title: "Mpumalanga Teachers Complete Digital Skills Training",
    description: "Over 500 teachers complete comprehensive training in digital teaching methods.",
    content: "The Mpumalanga Department of Education has successfully completed a digital skills training program for over 500 teachers across the province. The training covered online teaching tools, digital assessment methods, and creating engaging digital content for students.",
    province: "Mpumalanga",
    source: "Mpumalanga Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    category: "school",
    tags: ["teacher training", "digital skills", "technology"],
  },
  {
    id: "24",
    title: "Mpumalanga Schools Excel in Science Olympiad",
    description: "Students from Mpumalanga schools win multiple awards at national science competition.",
    content: "Students from various Mpumalanga schools have achieved outstanding results at the National Science Olympiad, winning gold, silver, and bronze medals in multiple categories. Education officials credit the province's focus on STEM education and after-school science clubs for the success.",
    province: "Mpumalanga",
    source: "Mpumalanga Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    category: "school",
    tags: ["science", "STEM", "competitions"],
  },
  // Additional Northern Cape articles
  {
    id: "25",
    title: "Northern Cape Schools Launch Robotics Program",
    description: "New robotics program introduces learners to coding and engineering concepts.",
    content: "The Northern Cape Department of Education has launched a robotics program in partnership with local tech companies. The program provides schools with robotics kits and training materials, introducing learners to coding, engineering, and problem-solving skills through hands-on projects.",
    province: "Northern Cape",
    source: "Northern Cape Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    category: "school",
    tags: ["robotics", "STEM", "engineering"],
  },
  {
    id: "26",
    title: "Northern Cape University Expands Distance Learning",
    description: "University increases online course offerings to reach remote communities.",
    content: "A Northern Cape university has significantly expanded its distance learning programs to better serve students in remote areas. The expansion includes new online courses, virtual tutoring sessions, and partnerships with community centers to provide study spaces and internet access.",
    province: "Northern Cape",
    source: "Northern Cape Higher Education",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), // 11 days ago
    category: "university",
    tags: ["distance learning", "online education", "accessibility"],
  },
  // Additional North West articles
  {
    id: "27",
    title: "North West Schools Implement Early Childhood Development Program",
    description: "New program focuses on preparing Grade R learners for primary school.",
    content: "The North West Department of Education has launched a comprehensive Early Childhood Development program targeting all Grade R classes in the province. The program includes specialized teacher training, age-appropriate learning materials, and parent engagement workshops to ensure children are well-prepared for primary school.",
    province: "North West",
    source: "North West Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    category: "school",
    tags: ["early childhood", "Grade R", "development"],
  },
  {
    id: "28",
    title: "North West University Launches Entrepreneurship Program",
    description: "New program supports student entrepreneurs with mentorship and funding.",
    content: "North West University has launched a comprehensive entrepreneurship program that provides students with mentorship, seed funding, and business development support. The program has already helped launch several successful student startups and aims to create a culture of innovation on campus.",
    province: "North West",
    source: "North West University",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    category: "university",
    tags: ["entrepreneurship", "innovation", "startups"],
  },
  // Additional Western Cape articles
  {
    id: "29",
    title: "Western Cape Schools Adopt Green Energy Initiatives",
    description: "Schools across Western Cape install solar panels and implement recycling programs.",
    content: "The Western Cape Education Department has launched a green energy initiative that has seen 30 schools install solar panels and implement comprehensive recycling programs. The initiative aims to teach students about sustainability while reducing schools' carbon footprint and electricity costs.",
    province: "Western Cape",
    source: "Western Cape Education Department",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    category: "school",
    tags: ["sustainability", "green energy", "environment"],
  },
  {
    id: "30",
    title: "CPUT Launches Innovation Hub for Engineering Students",
    description: "Cape Peninsula University of Technology opens new facility for engineering innovation.",
    content: "The Cape Peninsula University of Technology has opened a new innovation hub specifically for engineering students. The facility provides access to 3D printers, CNC machines, and prototyping equipment, enabling students to bring their engineering projects to life.",
    province: "Western Cape",
    source: "CPUT",
    sourceUrl: "#",
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    category: "university",
    tags: ["engineering", "innovation", "CPUT"],
  },
];

// Helper function to get news by province
export function getNewsByProvince(province: string | "All South Africa"): NewsArticle[] {
  if (province === "All South Africa") {
    return mockNewsArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }
  return mockNewsArticles
    .filter(article => article.province === province)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

// Helper function to search news
export function searchNews(query: string, province?: string | "All South Africa"): NewsArticle[] {
  const lowerQuery = query.toLowerCase();
  let articles = province === "All South Africa" || !province
    ? mockNewsArticles
    : mockNewsArticles.filter(article => article.province === province);

  return articles
    .filter(article => 
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      article.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

