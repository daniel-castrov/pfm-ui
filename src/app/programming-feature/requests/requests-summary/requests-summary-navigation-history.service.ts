export class RequestSummaryNavigationHistoryService {

    private requestSummaryNavigationHistory: IRequestSummaryNavigationHistory;
    private tempRequestSummaryNavigationHistory: IRequestSummaryNavigationHistory;

    constructor() {
        this.requestSummaryNavigationHistory = {};
        this.tempRequestSummaryNavigationHistory = {};
    }

    updateRequestSummaryNavigationHistory(requestSummaryNavigationHistory: IRequestSummaryNavigationHistory) {
        if (requestSummaryNavigationHistory) {
            if (requestSummaryNavigationHistory.selectedOrganization) {
                this.tempRequestSummaryNavigationHistory.selectedOrganization = requestSummaryNavigationHistory.selectedOrganization;
            }
            if (requestSummaryNavigationHistory.selectedOrganizationWidget) {
                this.tempRequestSummaryNavigationHistory.selectedOrganizationWidget = requestSummaryNavigationHistory.selectedOrganizationWidget;
            }
            if (requestSummaryNavigationHistory.selectedTOAWidget) {
                this.tempRequestSummaryNavigationHistory.selectedTOAWidget = requestSummaryNavigationHistory.selectedTOAWidget;
            }
        }
    }

    prepareNavigationHistory() {
        this.requestSummaryNavigationHistory = { ...this.tempRequestSummaryNavigationHistory };
    }

    getSelectedOrganization() {
        const selectedOrganization = this.requestSummaryNavigationHistory.selectedOrganization;
        this.requestSummaryNavigationHistory.selectedOrganization = undefined;
        return selectedOrganization;
    }

    getSelectedOrganizationWidget() {
        const selectedOrganizationWidget = this.requestSummaryNavigationHistory.selectedOrganizationWidget;
        this.requestSummaryNavigationHistory.selectedOrganizationWidget = undefined;
        return selectedOrganizationWidget;
    }

    getSelectedTOAWidget() {
        const selectedTOAWidget = this.requestSummaryNavigationHistory.selectedTOAWidget;
        this.requestSummaryNavigationHistory.selectedTOAWidget = undefined;
        return selectedTOAWidget;
    }

}

export interface IRequestSummaryNavigationHistory {
    selectedOrganization?: string;
    selectedOrganizationWidget?: string;
    selectedTOAWidget?: string;
    canRetrieve?: boolean;
}

export class RequestSummaryNavigationHistory {
    constructor(
        public selectedOrganization?: string,
        public selectedOrganizationWidget?: string,
        public selectedTOAWidget?: string,
        public canRetrieve?: boolean
    ) { }
}
