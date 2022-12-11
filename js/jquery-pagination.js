var mapJqueryPagination = {};

function openPage(viewId, page) {
    const pagination = mapJqueryPagination[viewId];
    pagination.pageActive = page;

    request(viewId, false);
}

function request(viewId, isResetData = false) {
    const pagination = mapJqueryPagination[viewId];
    if (isResetData) {
        pagination.resetData();
    }

    pagination.showLoadingIndicator();
    $.ajax({
        url: pagination.generateFullUrl(pagination.pageActive),
        type: "GET",
        success: function (response) {
            pagination.data = response.data;
            pagination.recordsTotal = response.recordsTotal;
            pagination.renderContentItem();
            pagination.renderPagination();
            pagination.renderRecordsTotal();
            pagination.hideLoadingIndicator();
        },
        error: function (xhr) {
            alert(xhr);
            pagination.hideLoadingIndicator();
        },
    });
}

class JqueryPagination {
    constructor(options) {
        this.viewId = options.viewId;
        this.url = options.url;
        this.formatRequestData = options.formatRequestData;
        this.renderItem = options.renderItem;
        this.pageEachSide = options.pageEachSide ? options.pageEachSide : 2;
        this.itemEachPage = options.itemEachPage ? options.itemEachPage : 10;

        mapJqueryPagination[this.viewId] = this;

        this.initDiv();
        this.update();
    }

    initDiv() {
        this.renderDivContent();
        this.renderDivLoadingIndicator();
        this.renderDivContentItem();
        this.renderDivPagination();
        this.renderDivRecordsTotal();
    }

    resetData() {
        this.data = [];
        this.pageActive = 1;
        this.pages = 0;
        this.recordsTotal = 0;
    }

    update() {
        request(this.viewId, true);
    }

    /*
            | RENDER FUNCTION
            | -> Render Container
            */
    renderDivContent() {
        const html = `<div id="${this.viewId}_content" class="position-relative p-4 mb-3"></div>`;

        $(`#${this.viewId}`).append(html);
    }

    renderDivContentItem() {
        const html = `<div id="${this.viewId}_content_items"></div>`;
        $(`#${this.viewId}_content`).append(html);
    }

    renderDivLoadingIndicator() {
        const html = `<div id="${this.viewId}_loading_overlay" class='position-absolute top-50 start-50 translate-middle rounded w-100 h-100'></div>
                <div id="${this.viewId}_loading_indicator"
                    class="position-absolute top-50 start-50 translate-middle">
                    <div class="pagination-loading-indicator"></div>
                </div>`;
        $(`#${this.viewId}_content`).append(html);
    }

    renderDivPagination() {
        const html = `
                <div id="${this.viewId}_pagination" class="row align-items-center justify-content-center"></div>`;
        $(`#${this.viewId}`).append(html);
    }

    renderDivRecordsTotal() {
        const html = `<div id="${this.viewId}_total" class="row align-items-center justify-content-center"></div>`;
        $(`#${this.viewId}`).append(html);
    }

    /*
            | RENDER FUNCTION
            | -> Render Content Inside Container
            */
    renderContentItem() {
        $(`#${this.viewId}_content_items`).html("");
        this.data.forEach((item) => {
            $(`#${this.viewId}_content_items`).append(this.renderItem(item));
        });
    }

    renderRecordsTotal() {
        const html = `<div class="col-auto">
                    <span class="fst-italic">Total ${this.recordsTotal} Record</span>
                </div>`;
        $(`#${this.viewId}_total`).html(html);
    }

    renderPagination() {
        this.pages = Math.ceil(this.recordsTotal / this.itemEachPage);
        const html = `<div class="col-auto">
                    <nav>
                        <ul class="pagination">
                            <li class="page-item" id="${this.viewId}_page_prev">
                                <a class="page-link" aria-label="Previous">
                                    <span aria-hidden="true">&laquo;</span>
                                </a>
                            </li>
                            ${this.renderPages()}
                            <li class="page-item" id="${this.viewId}_page_next">
                                <a class="page-link" aria-label="Next">
                                    <span aria-hidden="true">&raquo;</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>`;

        $(`#${this.viewId}_pagination`).html(html);
        this.refreshPageControl();
    }

    renderPages() {
        let html = "";
        if (this.pageEachSide * 2 < this.pages) {
            let arrPage = [];

            // Left Side
            for (let page = 1; page <= this.pageEachSide; page++) {
                arrPage.push(page);
                html += `<li class="page-item" id="${this.viewId}_page_${page}">
                            <a class="page-link" onclick="openPage('${this.viewId}', ${page})">
                                ${page}
                            </a>
                        </li>`;
            }

            // Left Active Page
            for (
                let page = Math.max(1, this.pageActive - this.pageEachSide);
                page <= this.pageActive;
                page++
            ) {
                if (!arrPage.includes(page)) {
                    if (page != arrPage[arrPage.length - 1] + 1) {
                        html += `<li class="page-item disabled">
                                    <a class="page-link">
                                        ...
                                    </a>
                                </li>`;
                    }

                    arrPage.push(page);
                    html += `<li class="page-item" id="${this.viewId}_page_${page}">
                                <a class="page-link" onclick="openPage('${this.viewId}', ${page})">
                                    ${page}
                                </a>
                            </li>`;
                }
            }

            // Right Active Page
            for (
                let page = this.pageActive + 1;
                page <=
                Math.min(this.pageActive + this.pageEachSide, this.pages);
                page++
            ) {
                if (!arrPage.includes(page)) {
                    arrPage.push(page);

                    html += `<li class="page-item" id="${this.viewId}_page_${page}">
                                <a class="page-link" onclick="openPage('${this.viewId}', ${page})">
                                    ${page}
                                </a>
                            </li>`;
                }
            }

            // Right Side
            for (
                let page = this.pages - this.pageEachSide + 1;
                page <= this.pages;
                page++
            ) {
                if (!arrPage.includes(page)) {
                    if (page != arrPage[arrPage.length - 1] + 1) {
                        html += `<li class="page-item disabled">
                                    <a class="page-link">
                                        ...
                                    </a>
                                </li>`;
                    }

                    arrPage.push(page);
                    html += `<li class="page-item" id="${this.viewId}_page_${page}">
                                <a class="page-link" onclick="openPage('${this.viewId}', ${page})">
                                    ${page}
                                </a>
                            </li>`;
                }
            }
        } else {
            for (let page = 1; page <= this.pages; page++) {
                html += `<li class="page-item" id="${this.viewId}_page_${page}">
                            <a class="page-link" onclick="openPage('${this.viewId}', ${page})">
                                ${page}
                            </a>
                        </li>`;
            }
        }

        return html;
    }

    /*
            | CONTROL FUNCTION
            | -> Control Element Inside Pagination
            */

    showLoadingIndicator() {
        // $(`#${this.viewId}_content_items`).hide();
        $(`#${this.viewId}_loading_indicator`).show();
        $(`#${this.viewId}_loading_overlay`).addClass(
            "pagination-loading-background"
        );
    }

    hideLoadingIndicator() {
        // $(`#${this.viewId}_content_items`).show();
        $(`#${this.viewId}_loading_indicator`).hide();
        $(`#${this.viewId}_loading_overlay`).removeClass(
            "pagination-loading-background"
        );
    }

    refreshPageControl() {
        const nextPage = Math.min(this.pageActive + 1, this.pages);
        const prevPage = Math.max(this.pageActive - 1, 1);

        $(`#${this.viewId}_page_${this.pageActive}`).addClass("active");

        $(`#${this.viewId}_page_prev`).removeClass("disabled");
        $(`#${this.viewId}_page_next`).removeClass("disabled");
        $(`#${this.viewId}_page_next`).click(function () {
            const viewId = this.id.split("_page_next")[0];
            openPage(viewId, nextPage);
        });
        $(`#${this.viewId}_page_prev`).click(function () {
            const viewId = this.id.split("_page_prev")[0];
            openPage(viewId, prevPage);
        });

        if (this.pages == 0) {
            $(`#${this.viewId}_page_next`).addClass("disabled");
            $(`#${this.viewId}_page_prev`).addClass("disabled");
            $(`#${this.viewId}_page_next`).click(function () {});
            $(`#${this.viewId}_page_prev`).click(function () {});
        } else {
            if (this.pageActive == this.pages) {
                // End of Pages
                $(`#${this.viewId}_page_next`).addClass("disabled");
                $(`#${this.viewId}_page_next`).click(function () {});
            }
            if (this.pageActive == 1) {
                // Start of Pages
                $(`#${this.viewId}_page_prev`).addClass("disabled");
                $(`#${this.viewId}_page_prev`).click(function () {});
            }
        }
    }

    /*
            | AJAX FUNCTION
            | -> Get Data From Server
            */

    generateFullUrl(page) {
        let params = {
            page: page,
            item_each_page: this.itemEachPage,
        };
        this.formatRequestData(params);

        let url = new URL(this.url);
        Object.keys(params).forEach(function (key) {
            url.searchParams.append(key, params[key]);
        });

        return url.href;
    }
}
