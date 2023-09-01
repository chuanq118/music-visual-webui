export class ProgressContext {

    constructor(totalDuration, progressDrawer) {
        this.totalDuration = totalDuration
        this.progressDrawer = progressDrawer
    }


    refresh(currentDuration) {
        this.progressDrawer.draw(currentDuration / this.totalDuration)
    }

    clear() {
        this.progressDrawer.clear()
    }
}
