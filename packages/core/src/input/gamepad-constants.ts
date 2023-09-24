export class GamepadConstants {

    static readonly BUTTON_A = 0;
    static readonly BUTTON_B = 1;
    static readonly BUTTON_X = 2;
    static readonly BUTTON_Y = 3;
    static readonly BUTTON_LB = 4;
    static readonly BUTTON_RB = 5;
    static readonly BUTTON_LT = 6;
    static readonly BUTTON_RT = 7;
    static readonly BUTTON_BACK = 8;
    static readonly BUTTON_START = 9;
    static readonly BUTTON_LS = 10;
    static readonly BUTTON_RS = 11;
    static readonly BUTTON_UP = 12;
    static readonly BUTTON_DOWN = 13;
    static readonly BUTTON_LEFT = 14;
    static readonly BUTTON_RIGHT = 15;
    static readonly BUTTON_SPECIAL = 16;

    static readonly BUTTON_STRING: ReadonlyArray<string> = Object.freeze([
        'A', 'B', 'X', 'Y',
        'LB', 'RB', 'LT', 'RT',
        'Back', 'Start', 'LS', 'RS',
        'Up', 'Down', 'Left', 'Right', 'Special']);

    static readonly AXIS_LEFT_X = 0;
    static readonly AXIS_LEFT_Y = 1;
    static readonly AXIS_RIGHT_X = 2;
    static readonly AXIS_RIGHT_Y = 3;

    static readonly AXIS_STRING: ReadonlyArray<string> = Object.freeze(['Left X', 'Left Y', 'Right X', 'Right Y']);
}
