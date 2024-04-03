// it('should navigate to root if no user data is found in sessionStorage', fakeAsync(() => {
//     spyOn(sessionStorage, 'getItem').and.returnValue(null);
//     service.init();
//     tick();
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
// }));

// it('should navigate to root and show snackBar if rejoinRoom fails', fakeAsync(() => {
//     const mockUser = { name: 'John Doe', roomId: 'room123', userId: 'user123' };
//     spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));
//     webSocketSpy.rejoinRoom.and.returnValue(Promise.resolve({ ok: false, error: 'Error joining room' }));
//     service.init();
//     tick();
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
//     expect(snackBarSpy.open).toHaveBeenCalledWith('Error joining room', undefined, { duration: SNACKBAR_DURATION });
// }));

// it('should set username based on user data from sessionStorage', async () => {
//     await service.init();
//     expect(service.usernameValue).toEqual('John Doe');
// });
