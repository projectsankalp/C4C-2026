from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05)

    def detect(self, data):
        # Detect sensor anomalies
        return self.model.fit_predict(data)
