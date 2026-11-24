export type TargetMouseEvents = 'click' | 'dblclick' | 'mousedown' | 'mouseup';
export type TargetTouchEvents = 'touchstart' | 'touchend';
export type TargetPointerEvents = 'pointerdown' | 'pointerup';
export type TargetEvents = TargetMouseEvents | TargetTouchEvents | TargetPointerEvents;

export type TargetOnOutEvents = `on${TargetEvents}out`;

export type GlobalOutEventHandlers = { [e in TargetOnOutEvents]: EventListener };

interface OutEvent {
	stop: HTMLElement[];
}

declare global {
	interface MouseEvent extends OutEvent { }
	interface TouchEvent extends OutEvent {
		relatedTarget: EventTarget;
	}
}
