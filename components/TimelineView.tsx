import React from 'react';
import { motion } from 'framer-motion';
import { YearGroup } from '../types';
import LoveTimer from './LoveTimer';

interface Props {
  yearGroups: YearGroup[];
  onSelectYear: (year: number) => void;
}

const getZodiac = (year: number): string => {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  // 2020 is Year of the Rat. (2020 - 4) % 12 = 0
  const index = (year - 4) % 12;
  return zodiacs[index >= 0 ? index : index + 12];
};

const TimelineView: React.FC<Props> = ({ yearGroups, onSelectYear }) => {
  return (
    <div className="w-full h-full flex flex-col pt-4 md:pt-10 pb-20 relative z-10 overflow-hidden">
      <LoveTimer />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
        <div className="max-w-4xl mx-auto py-8 pb-32">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {yearGroups.map((group, index) => {
              const zodiac = getZodiac(group.year);
              
              return (
                <motion.div
                  key={group.year}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectYear(group.year)}
                  className="group cursor-pointer relative"
                >
                  {/* Card Container */}
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                    
                    {/* Background Base */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#000000] border border-[#f3e5ab]/30 group-hover:border-[#FFD700] transition-colors rounded-xl"></div>
                    
                    {/* Decorative Pattern */}
                    <div className="absolute inset-2 border border-[#f3e5ab]/10 rounded-lg flex flex-col items-center justify-center">
                      
                      {/* Top Corner Number */}
                      <div className="absolute top-2 left-3 text-[#f3e5ab]/50 font-serif text-lg">{group.year}</div>

                      {/* Center Content: Zodiac */}
                      <div className="flex flex-col items-center justify-center space-y-2">
                        {/* Circle container for Zodiac */}
                        <div className="w-16 h-16 rounded-full border border-[#FFD700]/30 flex items-center justify-center bg-[#FFD700]/5 group-hover:bg-[#FFD700]/10 transition-colors">
                            <span className="text-3xl md:text-4xl text-[#FFD700] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)] font-serif">
                              {zodiac}
                            </span>
                        </div>
                        
                        <h3 className="font-playfair text-xl md:text-2xl text-[#f3e5ab] font-bold tracking-widest mt-2">
                          {group.year}
                        </h3>
                        <div className="h-px w-8 bg-[#f3e5ab]/40"></div>
                        <p className="text-[#f3e5ab]/60 text-[10px] md:text-xs uppercase tracking-wider">
                          {group.photos.length} 珍贵瞬间
                        </p>
                      </div>

                      {/* Bottom Corner Number (Rotated) */}
                      <div className="absolute bottom-2 right-3 text-[#f3e5ab]/50 font-serif text-lg transform rotate-180">{group.year}</div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ffd700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;