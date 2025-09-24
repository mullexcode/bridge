import React from 'react';

import Section2 from '../components/Home/Section2';
import Section3 from '../components/Home/Section3';
import Section4 from '../components/Home/Section4';
import Section5 from '../components/Home/Section5';
import Section6 from '../components/Home/Section6';
import Footer from '../components/Footer';
import Section1 from '../components/Home/Section1';

const Home: React.FC = () => {

  return (
    <div className='bg-[#000000] max-md:mt-[-64px] font-[lack] text-white w-full'>
      <Section1></Section1>
      <Section2></Section2>
      <Section3></Section3>
      <Section4></Section4>
      <Section5></Section5>
      <Section6></Section6>
      <Footer></Footer>
    </div>
  );
};

export default Home;