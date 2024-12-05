import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';

const content = {
  en: {
    title: 'What is Khaitun Tiger (KT)?',
    description: 'Khaitun Tiger (KT) is a blockchain project inspired by "Khaitun," a charismatic tiger from Khonkaen Zoo, Thailand. The project integrates blockchain technology with real-world applications, focusing on wildlife conservation 🐅, fostering local economic growth 💰, and driving sustainable tourism 🌍.',
    features: [
      {
        title: 'Wildlife Conservation',
        description: 'Financial support for animal care and rehabilitation in zoos. Future partnerships with conservation NGOs to protect endangered species.',
        image: '/467970237_956852316472370_5862938173089959610_n.jpg'
      },
      {
        title: 'Economic Empowerment',
        description: 'Drive revenue for zoos, local businesses, and tourism operators. Support job creation and economic growth in local communities.',
        image: '/Qmc1qdSe7y82kR7rbWgPLD1poWXnQXHFxjJbRLwUJgSaF7.jpg'
      },
      {
        title: 'Sustainable Tourism',
        description: 'Collaborate with airlines, hotels, and tour operators to enhance eco-friendly tourism experiences. Promote experiential tourism through unique packages.',
        image: '/QtrtTlC53zGn37ZQqGOM.webp'
      }
    ],
    tokenomics: {
      title: 'Tokenomics',
      blockchain: 'Solana',
      supply: '1 billion tokens',
      description: '100% decentralized; no private allocation'
    }
  },
  zh: {
    title: 'Khaitun Tiger (KT) 是什么？',
    description: 'Khaitun Tiger (KT) 是一个灵感来自泰国孔敬动物园"Khaitun"老虎的区块链项目。项目通过区块链技术结合现实应用，专注于野生动物保护 🐅、地方经济增长 💰 和可持续旅游 🌍。',
    features: [
      {
        title: '野生动物保护',
        description: '为动物园的动物护理和康复提供财务支持。未来与保护濒危物种的非政府组织合作。',
        image: '/467970237_956852316472370_5862938173089959610_n.jpg'
      },
      {
        title: '经济赋能',
        description: '为动物园、地方企业和旅游运营商创造收入。支持当地社区的就业机会和经济增长。',
        image: '/Qmc1qdSe7y82kR7rbWgPLD1poWXnQXHFxjJbRLwUJgSaF7.jpg'
      },
      {
        title: '可持续旅游',
        description: '与航空公司、酒店和旅游运营商合作，提升环保旅游体验。通过独特套餐推动体验式旅游。',
        image: '/QtrtTlC53zGn37ZQqGOM.webp'
      }
    ],
    tokenomics: {
      title: '代币经济学',
      blockchain: 'Solana',
      supply: '10 亿',
      description: '100% 去中心化；无私人配额'
    }
  },
  th: {
    title: 'ไข่ตุ๋น ไทเกอร์ (KT) คืออะไร?',
    description: 'ไข่ตุ๋น ไทเกอร์ (KT) คือโปรเจกต์ที่ได้รับแรงบันดาลใจจาก "ไข่ตุ๋น" เสือสุดหล่อจากสวนสัตว์ขอนแก่น ประเทศไทย โปรเจกต์นี้ผสมผสานเทคโนโลยี Blockchain กับการใช้งานจริง เน้นการอนุรักษ์สัตว์ป่า 🐅 การเติบโตของเศรษฐกิจท้องถิ่น 💰 และการท่องเที่ยวที่ยั่งยืน 🌍',
    features: [
      {
        title: 'การอนุรักษ์สัตว์ป่า',
        description: 'สนับสนุนการดูแลและฟื้นฟูสัตว์ในสวนสัตว์ ร่วมมือกับองค์กรอนุรักษ์เพื่อปกป้องสัตว์ใกล้สูญพันธุ์ในอนาคต',
        image: '/467970237_956852316472370_5862938173089959610_n.jpg'
      },
      {
        title: 'การส่งเสริมเศรษฐกิจ',
        description: 'สร้างรายได้ให้กับสวนสัตว์ ธุรกิจท้องถิ่น และผู้ประกอบการด้านการท่องเที่ยว สนับสนุนการสร้างงานและการเติบโตทางเศรษฐกิจในชุมชน',
        image: '/Qmc1qdSe7y82kR7rbWgPLD1poWXnQXHFxjJbRLwUJgSaF7.jpg'
      },
      {
        title: 'การท่องเที่ยวที่ยั่งยืน',
        description: 'ร่วมมือกับสายการบิน โรงแรม และผู้ให้บริการทัวร์ เพื่อเสริมสร้างการท่องเที่ยวเชิงอนุรักษ์ ส่งเสริมการท่องเที่ยวเชิงประสบการณ์ผ่านแพ็กเกจพิเศษ',
        image: '/QtrtTlC53zGn37ZQqGOM.webp'
      }
    ],
    tokenomics: {
      title: 'โทเคโนมิกส์',
      blockchain: 'Solana',
      supply: '1 พันล้าน',
      description: 'กระจายอำนาจ 100% ไม่มีการจัดสรรส่วนตัว'
    }
  }
};

const About = () => {
  const { language } = useLanguage();
  const t = content[language];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-8">{t.title}</h2>
        <p className="text-xl text-center mb-16 max-w-3xl mx-auto text-gray-300">{t.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {t.features.map((feature, index) => (
            <div key={index} className="card bg-gray-800/50 p-8 rounded-xl backdrop-blur-md hover:bg-gray-800/70 transition-all">
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="mb-6 text-gray-300">{feature.description}</p>
              <div className="relative w-full h-48 overflow-hidden rounded-lg">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-20">
          <h3 className="text-4xl font-bold text-center mb-12">Gallery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative w-full h-[500px] overflow-hidden rounded-xl group">
              <Image
                src="/VDRo7y7T9w6SreQ8xslu.webp"
                alt="KT Gallery 1"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="relative w-full h-[500px] overflow-hidden rounded-xl group">
              <Image
                src="/QtrtTlC53zGn37ZQqGOM.webp"
                alt="KT Gallery 2"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-md max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">{t.tokenomics.title}</h3>
          <div className="space-y-2 text-gray-300">
            <p><strong>Blockchain:</strong> {t.tokenomics.blockchain}</p>
            <p><strong>Supply:</strong> {t.tokenomics.supply}</p>
            <p>{t.tokenomics.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
