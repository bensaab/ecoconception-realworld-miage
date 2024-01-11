import { Component, Input, OnDestroy } from "@angular/core";
import { ArticlesService } from "../../core/services/articles.service";
import { ArticleListConfig } from "../../core/models/article-list-config.model";
import { Article } from "../../core/models/article.model";
import { ArticlePreviewComponent } from "./article-preview.component";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { LoadingState } from "../../core/models/loading-state.model";
import { Subject, interval } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";

@Component({
  selector: "app-article-list",
  styleUrls: ["article-list.component.css"],
  templateUrl: "./article-list.component.html",
  imports: [ArticlePreviewComponent, NgForOf, NgClass, NgIf],
  standalone: true,
})
export class ArticleListComponent implements OnDestroy {
  query!: ArticleListConfig;
  results: Article[] = [];
  currentPage = 1;
  totalPages: Array<number> = [];
  loading = LoadingState.NOT_LOADED;
  LoadingState = LoadingState;
  destroy$ = new Subject<void>();

  @Input() limit!: number;
  @Input()
  set config(config: ArticleListConfig) {
    if (config) {
      this.query = config;
      this.currentPage = 1;
      this.runQuery();
    }
  }

  constructor(private articlesService: ArticlesService) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setPageTo(pageNumber: number) {
    this.currentPage = pageNumber;
    this.runQuery();
  }

  runQuery() {
    this.loading = LoadingState.LOADING;
    this.results = [];

    // Create limit and offset filter (if necessary)
    if (this.limit) {
      this.query.filters.limit = 6000;
    //  this.query.filters.offset = this.limit * (this.currentPage - 1);
    }

    // this.articlesService
    //   .query(this.query)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((data) => {
    //     this.loading = LoadingState.LOADED;
    //     this.results = data.articles;

    //     // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
    //     this.totalPages = Array.from(
    //       new Array(Math.ceil(data.articlesCount / this.limit)),
    //       (val, index) => index + 1
    //     );
    //   });

    interval(5000)
      .pipe(
        takeUntil(this.destroy$), 
        switchMap(() => this.articlesService.query(this.query)) 
      )
      .subscribe((data) => {
        this.loading = LoadingState.LOADED;
        this.results.push(data.articles[this.currentPage]);

        // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
        this.totalPages = Array.from(
          new Array(Math.ceil(data.articlesCount / this.limit)),
          (val, index) => index + 1
        );
      });
  }
}
