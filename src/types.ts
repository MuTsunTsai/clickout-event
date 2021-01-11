
type TargetMouseEvents = 'click' | 'dblclick' | 'mousedown' | 'mouseup';
type TargetTouchEvents = 'touchstart' | 'touchend';
type TargetPointerEvents = 'pointerdown' | 'pointerup';
type TargetEvents = TargetMouseEvents | TargetTouchEvents | TargetPointerEvents;

type TargetOnMouseOutEvents = 'onclickout' | 'ondblclickout' | 'onmousedownout' | 'onmouseupout';
type TargetOnTouchOutEvents = 'ontouchstartout' | 'ontouchendout';
type TargetOnPointerOutEvents = 'onpointerdownout' | 'onpointerupout';
type TargetOnOutEvents = TargetOnMouseOutEvents | TargetOnTouchOutEvents | TargetOnPointerOutEvents;

type GlobalOutEventHandlers = { [e in TargetOnOutEvents]: EventListener };

interface OutEvent {
	stop: HTMLElement[];
}

interface MouseEvent extends OutEvent { }
interface TouchEvent extends OutEvent {
	relatedTarget: EventTarget;
}
