const COUNTER_ID = 107247242;

function canTrack(): boolean {
    return typeof ym !== 'undefined';
}

export const analytics = {
    trackPlaceLink(placeName: string): void {
        if (canTrack()) {
            ym(COUNTER_ID, 'reachGoal', 'place_link_click', { place: placeName });
        }
    },
    trackVideoOpen(videoName: string): void {
        if (canTrack()) {
            ym(COUNTER_ID, 'reachGoal', 'video_modal_open', { title: videoName });
        }
    },
    trackFormSubmit(): void {
        if (canTrack()) {
            ym(COUNTER_ID, 'reachGoal', 'form_subscribe');
        }
    },
};
