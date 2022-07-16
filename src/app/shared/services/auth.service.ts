import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { GoogleAuthProvider, UserInfo } from 'firebase/auth';
import { Observable, first, from, map, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: AngularFireAuth) {}

  isAuthenticated(): Observable<boolean> {
    return this.auth.authState.pipe(map((user) => !!user));
  }

  logIn(): Observable<UserInfo | null> {
    return from(this.auth.signInWithPopup(new GoogleAuthProvider())).pipe(
      switchMap(() => this.getUser()),
      first()
    );
  }

  logOut(): Observable<void> {
    return from(this.auth.signOut());
  }

  getUser(): Observable<UserInfo | null> {
    return this.auth.user;
  }
}
