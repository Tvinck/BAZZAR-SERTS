/**
 * BazzarSerts.m — Objective-C dylib that shows a native iOS alert
 * "Скачано с BazzarSerts" 3 seconds after app launch.
 *
 * Compiled as a dynamic library and injected into IPA bundles.
 * The constructor runs automatically when the dylib is loaded.
 */

#import <UIKit/UIKit.h>

__attribute__((constructor))
static void bazzarSerts_showNotification(void) {
    // Wait for the app to fully initialize and present its root UI
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{

        // Find the key window (iOS 13+ scene-based)
        UIWindow *keyWindow = nil;

        if (@available(iOS 13.0, *)) {
            for (UIWindowScene *scene in UIApplication.sharedApplication.connectedScenes) {
                if (scene.activationState == UISceneActivationStateForegroundActive) {
                    for (UIWindow *w in scene.windows) {
                        if (w.isKeyWindow) { keyWindow = w; break; }
                    }
                    if (keyWindow) break;
                }
            }
            // Fallback: first window of first foreground scene
            if (!keyWindow) {
                for (UIWindowScene *scene in UIApplication.sharedApplication.connectedScenes) {
                    if (scene.windows.count > 0) {
                        keyWindow = scene.windows.firstObject;
                        break;
                    }
                }
            }
        }

        // Legacy fallback (iOS < 13)
        if (!keyWindow) {
            #pragma clang diagnostic push
            #pragma clang diagnostic ignored "-Wdeprecated-declarations"
            keyWindow = UIApplication.sharedApplication.keyWindow;
            #pragma clang diagnostic pop
        }

        if (!keyWindow) return;

        // Walk up to the topmost presented view controller
        UIViewController *topVC = keyWindow.rootViewController;
        while (topVC.presentedViewController) {
            topVC = topVC.presentedViewController;
        }

        if (!topVC) return;

        // Build the alert
        UIAlertController *alert = [UIAlertController
            alertControllerWithTitle:@"BazzarSerts"
            message:@"Скачано с BazzarSerts"
            preferredStyle:UIAlertControllerStyleAlert];

        [alert addAction:[UIAlertAction
            actionWithTitle:@"Посмотреть ещё"
            style:UIAlertActionStyleDefault
            handler:^(UIAlertAction * _Nonnull action) {
                NSURL *url = [NSURL URLWithString:@"https://www.bazzar-serts.shop/"];
                [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
            }]];

        [alert addAction:[UIAlertAction
            actionWithTitle:@"OK"
            style:UIAlertActionStyleCancel
            handler:nil]];

        [topVC presentViewController:alert animated:YES completion:nil];
    });
}
