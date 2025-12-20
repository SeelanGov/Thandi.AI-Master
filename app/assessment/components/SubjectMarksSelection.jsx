'use client';

import { useState } from 'react';

const SUBJECTS = [
  // Core subjects
  { id: 'mathematics', name: 'Mathematics', category: 'core', emoji: '🔢' },
  { id: 'math_literacy', name: 'Mathematical Literacy', category: 'core', emoji: '📊' },
  
  // Sciences
  { id: 'physical_science', name: 'Physical Sciences', category: 'science', emoji: '⚗️' },
  { id: 'life_sciences', name: 'Life Sciences', category: 'science', emoji: '🧬' },
  
  // Commerce
  { id: 'accounting', name: 'Accounting', category: 'commerce', emoji: 