import pandas as pd
import matplotlib.pyplot as plt
import glob
import os


# -----------------------------------
# FIND SESSION FILES
# -----------------------------------

session_files = glob.glob("data/session_logs/*.csv")

print("\nDetected Session Files:")
print(session_files)


if not session_files:

    print("\nERROR: No session files found.")

    exit()


# -----------------------------------
# GET LATEST FILE
# -----------------------------------

latest_file = max(session_files, key=os.path.getctime)

print(f"\nLoading Session File:\n{latest_file}\n")


# -----------------------------------
# LOAD CSV
# -----------------------------------

df = pd.read_csv(latest_file)

print("\nCSV HEAD:\n")

print(df.head())


# -----------------------------------
# CHECK EMPTY
# -----------------------------------

if df.empty:

    print("\nERROR: CSV file is empty.")

    exit()


# -----------------------------------
# CREATE TIME AXIS
# -----------------------------------

time_axis = df["timestamp_ms"] / 1000.0


# -----------------------------------
# CREATE FIGURE
# -----------------------------------

plt.figure(figsize=(14, 8))


# -----------------------------------
# PLOT SIGNALS
# -----------------------------------

plt.plot(time_axis, df["hip_y"], label="Hip Y")

plt.plot(time_axis, df["knee_y"], label="Knee Y")

plt.plot(time_axis, df["ankle_y"], label="Ankle Y")

plt.plot(time_axis, df["heel_y"], label="Heel Y")


# -----------------------------------
# LABELS
# -----------------------------------

plt.title("Lower Body Trajectories")

plt.xlabel("Time (seconds)")

plt.ylabel("Normalized Coordinate")

plt.legend()

plt.grid(True)


print("\nDisplaying Plot Window...\n")


# -----------------------------------
# SHOW
# -----------------------------------

plt.show()