export const HANDLE_RADIUS = 5;
export const POINT_RADIUS = 6;
export const HIT_AREA_RADIUS = 12;

export const LINEAR_HIT_THRESHOLD = 0.1;
export const LINEAR_PATH_SAMPLES = 40;
export const DRAG_ACTIVATION_DISTANCE_PX = 4;
export const DRAG_ACTIVATION_DISTANCE_PX_SQUARED = DRAG_ACTIVATION_DISTANCE_PX * DRAG_ACTIVATION_DISTANCE_PX;

export const DEFAULT_HANDLE_LENGTH = 0.15;
export const SVG_WIDTH = 400;
export const SVG_HEIGHT = 300;

export const GRID_SNAP_THRESHOLD = 0.05;

export const BEZIER_CONTROL_MIN_Y = -0.5;
export const BEZIER_CONTROL_MAX_Y = 1.5;

type EasingPresetOption = {
  value: string;
  label: string;
};

type EasingPreset = {
  label: string;
  options: EasingPresetOption[];
};

export const EASING_PRESETS: EasingPreset[] = [
  {
    label: 'Standard',
    options: [
      {
        value: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        label: 'ease'
      },
      {
        value: 'cubic-bezier(0.42, 0, 1, 1)',
        label: 'ease-in'
      },
      {
        value: 'cubic-bezier(0, 0, 0.58, 1)',
        label: 'ease-out'
      },
      {
        value: 'cubic-bezier(0.42, 0, 0.58, 1)',
        label: 'ease-in-out'
      }
    ]
  },
  {
    label: 'Cubic',
    options: [
      {
        value: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        label: 'easeInCubic'
      },
      {
        value: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        label: 'easeOutCubic'
      },
      {
        value: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        label: 'easeInOutCubic'
      }
    ]
  },
  {
    label: 'Back (overshoot)',
    options: [
      {
        value: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
        label: 'easeInBack'
      },
      {
        value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        label: 'easeOutBack'
      },
      {
        value: 'cubic-bezier(0.68, -0.4, 0.32, 1.4)',
        label: 'easeInOutBack'
      }
    ]
  },
  {
    label: 'Spring',
    options: [
      {
        value: 'linear(0, 0.6 18%, 1.1 36%, 0.94 48%, 1.02 60%, 0.98 72%, 1.01 84%, 1)',
        label: 'springGentle'
      },
      {
        value: 'linear(0, 0.8 12%, 1.2 28%, 0.88 44%, 1.08 58%, 0.96 72%, 1.02 86%, 1)',
        label: 'springBouncy'
      },
      {
        value: 'linear(0, 1.4 20%, 0.85 40%, 1.1 60%, 0.95 80%, 1)',
        label: 'springSnappy'
      },
      {
        value:
          'linear(0, 0.03 1.1%, 0.125 2.4%, 0.906 9.8%, 1.046 12.3%, 1.11 15%, 1.116 16.3%, 1.11 17.8%, 1.014 25.8%, 0.987 31.2%, 1.001 47.2%, 1)',
        label: 'springSnap'
      },
      {
        value:
          'linear(0, 0.012 0.9%, 0.05 2%, 0.411 9.2%, 0.517 11.8%, 0.611 14.6%, 0.694 17.7%, 0.765 21.1%, 0.824 24.8%, 0.872 28.9%, 0.91 33.4%, 0.939 38.4%, 0.977 50.9%, 0.994 68.4%, 1)',
        label: 'springGlide'
      },
      {
        value:
          'linear(0, 0.008 1.1%, 0.034 2.3%, 0.134 4.9%, 0.264 7.3%, 0.683 14.3%, 0.797 16.5%, 0.89 18.6%, 0.967 20.7%, 1.027 22.8%, 1.073 25%, 1.104 27.3%, 1.123 30.6%, 1.119 34.3%, 1.018 49.5%, 0.988 58.6%, 0.985 65.2%, 1 84.5%, 1)',
        label: 'springLazy'
      }
    ]
  },
  {
    label: 'Bounce',
    options: [
      {
        value: 'linear(0, 0.22 15%, 0.5 30%, 0.78 45%, 1 60%, 0.88 70%, 1 80%, 0.95 88%, 1)',
        label: 'bounceOut'
      },
      {
        value: 'linear(0, 0.05 12%, 0 24%, 0.12 36%, 0.5 50%, 0.88 64%, 1 76%, 0.95 88%, 1)',
        label: 'bounceInOut'
      },
      {
        value:
          'linear(0, 0.008 1.1%, 0.034 2.3%, 0.134 4.9%, 0.264 7.3%, 0.683 14.3%, 0.797 16.5%, 0.89 18.6%, 0.967 20.7%, 1.027 22.8%, 1.073 25%, 1.104 27.3%, 1.123 30.6%, 1.119 34.3%, 1.018 49.5%, 0.988 58.6%, 0.985 65.2%, 1 84.5%, 1)',
        label: 'bounceGentle'
      },
      {
        value:
          'linear(0, 0.453 7.8%, 0.803 16.1%, 1.048 24.9%, 1.132 29.5%, 1.194 34.4%, 1.227 38.4%, 1.245 42.5%, 1.25 46.9%, 1.242 51.7%, 1.2 60.5%, 1.038 84.9%, 1.009 92.5%, 1)',
        label: 'bounceSmooth'
      }
    ]
  },
  {
    label: 'Elastic',
    options: [
      {
        value: 'linear(0, 1.3 24%, 0.85 42%, 1.1 58%, 0.95 74%, 1.02 88%, 1)',
        label: 'elasticOut'
      },
      {
        value: 'linear(0, -0.1 18%, 0.15 36%, 0.5 50%, 0.85 64%, 1.1 82%, 1)',
        label: 'elasticInOut'
      },
      {
        value:
          'linear(0, 0.43 3.9%, 0.72 7.4%, 0.95 14.2%, 0.77 20.8%, -0.1 35.9%, -0.3 46.3%, -0.05 63.6%, 0.03 77.2%, 0)',
        label: 'elasticBounce'
      },
      {
        value:
          'linear(0, 0.59 6.1%, 0.77 11.4%, 0.6 16.9%, -0.24 29%, -0.41 35.7%, 0.03 51.2%, 0.14 59.9%, -0.02 82.8%, 0)',
        label: 'elasticBounceHard'
      }
    ]
  },
  {
    label: 'Overshoot',
    options: [
      {
        value: 'linear(0, 1 44.7%, 0.898 51.8%, 0.874 55.1%, 0.866 58.4%, 0.888 64.3%, 1 77.4%, 0.98 84.5%, 1)',
        label: 'overshootSettle'
      },
      {
        value:
          'linear(0, 0.402 7.4%, 0.711 15.3%, 0.929 23.7%, 1.008 28.2%, 1.067 33%, 1.099 36.9%, 1.12 41%, 1.13 45.4%, 1.13 50.1%, 1.111 58.5%, 1.019 83.2%, 1.004 91.3%, 1)',
        label: 'overshootSmooth'
      },
      {
        value:
          'linear(0, 0.544 5.5%, 0.947 11.5%, 1.14 18.1%, 1.23 25.5%, 1.25 31.1%, 1.23 37.6%, 1.08 61.8%, 1.03 73.7%, 1)',
        label: 'overshootStrong'
      },
      {
        value:
          'linear(0, -0.004 8.7%, -0.019 16.8%, -0.111 41.5%, -0.13 49.9%, -0.13 54.6%, -0.12 59%, -0.099 63.1%, -0.067 67%, -0.008 71.8%, 0.071 76.3%, 0.289 84.7%, 0.598 92.6%, 1)',
        label: 'overshootSoftIn'
      },
      {
        value:
          'linear(0, 0.402 7.4%, 0.711 15.3%, 0.929 23.7%, 1.008 28.2%, 1.067 33%, 1.099 36.9%, 1.12 41%, 1.13 45.4%, 1.13 50.1%, 1.111 58.5%, 1.019 83.2%, 1.004 91.3%, 1)',
        label: 'overshootSoftOut'
      },
      {
        value:
          'linear(0, -0.004 4.9%, -0.02 9.4%, -0.124 26.4%, -0.126 30.5%, -0.104 34.1%, -0.027 38.8%, 0.108 43.1%, 0.299 47%, 0.817 55.2%, 0.97 59.1%, 1.071 63.4%, 1.118 67.7%, 1.127 72.6%, 1.108 77.2%, 1.019 90.7%, 1.004 95.2%, 1)',
        label: 'overshootSoftInOut'
      }
    ]
  },
  {
    label: 'Anticipate',
    options: [
      {
        value:
          'linear(0, -0.009 7.5%, -0.038 15.1%, -0.2 39.5%, -0.242 48.3%, -0.25 53.1%, -0.245 57.5%, -0.227 61.6%, -0.194 65.6%, -0.132 70.5%, -0.048 75.1%, 0.197 83.9%, 0.547 92.2%, 1)',
        label: 'anticipate'
      },
      {
        value:
          'linear(0, -0.008 4.1%, -0.035 8.3%, -0.179 21.1%, -0.216 25.3%, -0.228 29.5%, -0.208 33.3%, -0.121 38.2%, 0.036 42.7%, 0.261 46.8%, 0.881 55.6%, 1.058 59.7%, 1.172 64.1%, 1.222 68.6%, 1.228 71.1%, 1.221 73.7%, 1.183 78.5%, 1.034 91.8%, 1.008 95.9%, 1)',
        label: 'anticipateOvershoot'
      }
    ]
  },
  {
    label: 'Expo',
    options: [
      {
        value: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        label: 'easeInExpo'
      },
      {
        value: 'cubic-bezier(0.19, 1, 0.22, 1)',
        label: 'easeOutExpo'
      },
      {
        value: 'cubic-bezier(1, 0, 0, 1)',
        label: 'easeInOutExpo'
      }
    ]
  }
];
