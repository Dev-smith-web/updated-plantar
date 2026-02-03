import Foundation
import Combine

// MARK: - App Bootstrap
class AppBootstrap {
    static let shared = AppBootstrap()
    
    private init() {}
    
    /// Initialize all services
    func initialize() {
        registerServices()
        print("[AppBootstrap] App initialization complete")
    }
    
    // MARK: - Service Registration
    private func registerServices() {
        // Register mock data service
        let mockDataService = MockDataService()
        ServiceLocator.shared.register(mockDataService)
        
        // Register AR service
        let arService = ARService()
        ServiceLocator.shared.register(arService)
        
        print("[AppBootstrap] Services registered")
    }
}
