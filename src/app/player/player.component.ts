import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, first } from 'rxjs';

import { PlayerService } from './player.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit, OnDestroy {
  subs = new Subscription();

  constructor(public playerService: PlayerService, private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.subs.add(
      this.activatedRoute.paramMap.subscribe((paramMap) => {
        const id = paramMap.get('id') ?? '';

        this.playerService
          .loadQuizee(id)
          .pipe(first())
          .subscribe({
            error: () => {
              this.router.navigate(['solve/404']);
            },
          });
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
