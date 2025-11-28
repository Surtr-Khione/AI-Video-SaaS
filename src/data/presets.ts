import { v4 as uuidv4 } from 'uuid';
import { EffectPreset, TransitionPreset, EffectType, TransitionType } from '@/types/timeline';

export const effectPresets: EffectPreset[] = [
  // Color Correction Presets
  {
    id: uuidv4(),
    name: 'Cinematic',
    category: 'color',
    effects: [
      {
        type: 'color-correction' as EffectType,
        enabled: true,
        parameters: {
          contrast: 15,
          saturation: 20,
          temperature: 10,
          highlights: -10,
          shadows: 15,
        },
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Warm Tone',
    category: 'color',
    effects: [
      {
        type: 'color-correction' as EffectType,
        enabled: true,
        parameters: {
          temperature: 40,
          tint: 10,
          saturation: 10,
        },
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Cool Tone',
    category: 'color',
    effects: [
      {
        type: 'color-correction' as EffectType,
        enabled: true,
        parameters: {
          temperature: -40,
          tint: -10,
          saturation: 10,
        },
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'High Contrast',
    category: 'color',
    effects: [
      {
        type: 'color-correction' as EffectType,
        enabled: true,
        parameters: {
          contrast: 40,
          highlights: 20,
          shadows: -20,
        },
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Vibrant',
    category: 'color',
    effects: [
      {
        type: 'color-correction' as EffectType,
        enabled: true,
        parameters: {
          saturation: 50,
          brightness: 10,
          contrast: 15,
        },
      },
    ],
  },

  // Stylize Presets
  {
    id: uuidv4(),
    name: 'Grayscale',
    category: 'stylize',
    effects: [
      {
        type: 'grayscale' as EffectType,
        enabled: true,
        parameters: {},
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Sepia',
    category: 'stylize',
    effects: [
      {
        type: 'sepia' as EffectType,
        enabled: true,
        parameters: {},
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Film Grain',
    category: 'stylize',
    effects: [
      {
        type: 'grain' as EffectType,
        enabled: true,
        parameters: {
          amount: 30,
        },
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Vignette',
    category: 'stylize',
    effects: [
      {
        type: 'vignette' as EffectType,
        enabled: true,
        parameters: {
          amount: 50,
          roundness: 50,
        },
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Soft Glow',
    category: 'stylize',
    effects: [
      {
        type: 'glow' as EffectType,
        enabled: true,
        parameters: {
          intensity: 40,
          threshold: 60,
        },
      },
    ],
  },

  // Blur Presets
  {
    id: uuidv4(),
    name: 'Gaussian Blur',
    category: 'blur',
    effects: [
      {
        type: 'blur' as EffectType,
        enabled: true,
        parameters: {
          amount: 30,
          type: 'gaussian',
        },
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Motion Blur',
    category: 'blur',
    effects: [
      {
        type: 'blur' as EffectType,
        enabled: true,
        parameters: {
          amount: 40,
          type: 'motion',
          angle: 0,
        },
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Sharpen',
    category: 'blur',
    effects: [
      {
        type: 'sharpen' as EffectType,
        enabled: true,
        parameters: {
          amount: 50,
        },
      },
    ],
  },
];

export const transitionPresets: TransitionPreset[] = [
  // Fade Transitions
  {
    id: uuidv4(),
    name: 'Fade In',
    category: 'fade',
    transition: {
      type: 'fade' as TransitionType,
      duration: 1,
      position: 'in',
      easing: 'ease-in-out',
    },
  },
  {
    id: uuidv4(),
    name: 'Fade Out',
    category: 'fade',
    transition: {
      type: 'fade' as TransitionType,
      duration: 1,
      position: 'out',
      easing: 'ease-in-out',
    },
  },
  {
    id: uuidv4(),
    name: 'Cross Dissolve',
    category: 'fade',
    transition: {
      type: 'cross-dissolve' as TransitionType,
      duration: 1.5,
      position: 'between',
      easing: 'ease-in-out',
    },
  },
  {
    id: uuidv4(),
    name: 'Dip to Black',
    category: 'fade',
    transition: {
      type: 'dip-to-black' as TransitionType,
      duration: 1,
      position: 'between',
      easing: 'linear',
    },
  },

  // Wipe Transitions
  {
    id: uuidv4(),
    name: 'Wipe Left',
    category: 'wipe',
    transition: {
      type: 'wipe-left' as TransitionType,
      duration: 0.8,
      position: 'between',
      easing: 'ease-in-out',
    },
  },
  {
    id: uuidv4(),
    name: 'Wipe Right',
    category: 'wipe',
    transition: {
      type: 'wipe-right' as TransitionType,
      duration: 0.8,
      position: 'between',
      easing: 'ease-in-out',
    },
  },
  {
    id: uuidv4(),
    name: 'Wipe Up',
    category: 'wipe',
    transition: {
      type: 'wipe-up' as TransitionType,
      duration: 0.8,
      position: 'between',
      easing: 'ease-in-out',
    },
  },
  {
    id: uuidv4(),
    name: 'Wipe Down',
    category: 'wipe',
    transition: {
      type: 'wipe-down' as TransitionType,
      duration: 0.8,
      position: 'between',
      easing: 'ease-in-out',
    },
  },

  // Slide Transitions
  {
    id: uuidv4(),
    name: 'Slide Left',
    category: 'slide',
    transition: {
      type: 'slide-left' as TransitionType,
      duration: 1,
      position: 'between',
      easing: 'ease-in-out',
    },
  },
  {
    id: uuidv4(),
    name: 'Slide Right',
    category: 'slide',
    transition: {
      type: 'slide-right' as TransitionType,
      duration: 1,
      position: 'between',
      easing: 'ease-in-out',
    },
  },

  // Zoom Transitions
  {
    id: uuidv4(),
    name: 'Zoom In',
    category: 'zoom',
    transition: {
      type: 'zoom-in' as TransitionType,
      duration: 1,
      position: 'in',
      easing: 'ease-out',
    },
  },
  {
    id: uuidv4(),
    name: 'Zoom Out',
    category: 'zoom',
    transition: {
      type: 'zoom-out' as TransitionType,
      duration: 1,
      position: 'out',
      easing: 'ease-in',
    },
  },
];

export const blendModes = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
];
