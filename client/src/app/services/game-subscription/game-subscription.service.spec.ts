// it('should remove player from players list and call banUser on websocketService', () => {
//     const player = 'playerName';
//     service['players'] = new Set(['player1', player, 'player3']);
//     service.onKickPlayer(player);
//     expect(service['players'].has(player)).toBeFalse();
//     expect(webSocketSpy.banUser).toHaveBeenCalled();
// });

// it('should assign question when state is AskingQuestion with payload', () => {
//     service['setState']({ state: GameState.AskingQuestion, payload: mockQuestion });
//     expect(service['question']).toEqual(mockQuestion);
//     expect(service['choicesSelected']).toEqual([false, false, false, false]);
// });
// it('should update title when state is Starting', () => {
//     const title = 'New Game Title';
//     service['setState']({ state: GameState.Starting, payload: title });
//     expect(gameSubSpy.title).toEqual(title);
// });
// it('should navigate to /results if state is ShowFinalResults and current url is not /results', fakeAsync(() => {
//     gameSubSpy.state = GameState.ShowFinalResults;
//     service['setState']({ state: GameState.ShowFinalResults, payload: undefined });
//     const navigateSpy = spyOn(service['routerService'], 'navigate');
//     expect(navigateSpy).toHaveBeenCalledWith(['/results']);
// }));
// it('setState() should set the state and payload', () => {
//     const state = GameState.ShowResults;
//     const payload = 'payload';
//     service['setState']({ state, payload });
//     expect(gameSubSpy.state).toEqual(state);
// });
// it('should return if game state is not started', () => {
//     gameSubSpy.state = GameState.NotStarted;
//     service['setState']({ state: GameState.NotStarted, payload: undefined });
//     expect(gameSubSpy.state).toEqual(GameState.NotStarted);
// });
