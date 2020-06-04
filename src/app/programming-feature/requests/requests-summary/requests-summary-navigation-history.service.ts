import { Injectable } from '@angular/core';

@Injectable()
export class RequestSummaryNavigationHistoryService {
  private requestSummaryNavigationHistory: IRequestSummaryNavigationHistory;
  private tempRequestSummaryNavigationHistory: IRequestSummaryNavigationHistory;

  constructor() {
    this.requestSummaryNavigationHistory = {};
    this.tempRequestSummaryNavigationHistory = {};
  }

  updateRequestSummaryNavigationHistory(requestSummaryNavigationHistory: IRequestSummaryNavigationHistory) {
    if (requestSummaryNavigationHistory) {
      if (requestSummaryNavigationHistory.selectedContainer) {
        this.tempRequestSummaryNavigationHistory.selectedContainer = requestSummaryNavigationHistory.selectedContainer;
      }
      if (requestSummaryNavigationHistory.selectedOrganization) {
        this.tempRequestSummaryNavigationHistory.selectedOrganization =
          requestSummaryNavigationHistory.selectedOrganization;
      }
      if (requestSummaryNavigationHistory.selectedOrganizationWidget) {
        this.tempRequestSummaryNavigationHistory.selectedOrganizationWidget =
          requestSummaryNavigationHistory.selectedOrganizationWidget;
      }
      if (requestSummaryNavigationHistory.selectedTOAWidget) {
        this.tempRequestSummaryNavigationHistory.selectedTOAWidget = requestSummaryNavigationHistory.selectedTOAWidget;
      }
    }
  }

  prepareNavigationHistory() {
    this.requestSummaryNavigationHistory = { ...this.tempRequestSummaryNavigationHistory };
  }

  getSelectedContainer() {
    const selectedContainer = this.requestSummaryNavigationHistory.selectedContainer;
    this.requestSummaryNavigationHistory.selectedContainer = undefined;
    return selectedContainer;
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
  selectedContainer?: string;
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
  ) {}
}
