class ExponentialSmoother:

    def __init__(self, alpha=0.3):

        self.alpha = alpha

        self.previous_value = None

    def update(self, current_value):

        if self.previous_value is None:

            self.previous_value = current_value

            return current_value

        smoothed = (
            self.alpha * current_value
            +
            (1 - self.alpha) * self.previous_value
        )

        self.previous_value = smoothed

        return smoothed