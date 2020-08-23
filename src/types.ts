
type TargetMouseEvents = 'click' | 'dblclick' | 'mousedown' | 'mouseup';
type TargetTouchEvents = 'touchstart' | 'touchend';
type TargetEvents = TargetMouseEvents | TargetTouchEvents;

type TargetOnMouseOutEvents = 'onclickout' | 'ondblclickout' | 'onmousedownout' | 'onmouseupout';
type TargetOnTouchOutEvents = 'ontouchstartout' | 'ontouchendout';
type TargetOnOutEvents = TargetOnMouseOutEvents | TargetOnTouchOutEvents;

type GlobalOutEventHandlers = { [e in TargetOnOutEvents]: EventListener };

interface OutEvent {
	stopList: HTMLElement[];
}

interface MouseEvent extends OutEvent { }
interface TouchEvent extends OutEvent { }
