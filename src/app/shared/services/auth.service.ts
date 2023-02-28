import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, UserInfo, authState, signInWithPopup, signOut, user } from '@angular/fire/auth';

import { Observable, first, from, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth) {}

  isAuthenticated(): Observable<boolean> {
    return authState(this.auth).pipe(map((user) => !!user));
  }

  logIn(): Observable<UserInfo | null> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      switchMap(() => this.getUser()),
      first()
    );
  }

  logOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  getUser(): Observable<UserInfo | null> {
    return user(this.auth);
  }
}
