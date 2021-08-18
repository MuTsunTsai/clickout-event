
type TargetMouseEvents = 'click' | 'dblclick' | 'mousedown' | 'mouseup';
type TargetTouchEvents = 'touchstart' | 'touchend';
type TargetPointerEvents = 'pointerdown' | 'pointerup';
type TargetEvents = TargetMouseEvents | TargetTouchEvents | TargetPointerEvents;

type TargetOnOutEvents = `on${TargetEvents}out`;

type GlobalOutEventHandlers = { [e in TargetOnOutEvents]: EventListener };

interface OutEvent {
	stop: HTMLElement[];
}

interface MouseEvent extends OutEvent { }
interface TouchEvent extends OutEvent {
	relatedTarget: EventTarget;
}
