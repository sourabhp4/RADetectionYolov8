from flask import Flask, request, jsonify
import numpy as np
import cv2
from ultralytics import YOLO
from flask_cors import CORS
import base64
import os
from dotenv import load_dotenv

load_dotenv()

# Replace with your model path
model_path = os.environ.get('MODEL_PATH')

# Load the YOLOv8 model
model = YOLO(model_path)

# Classes names respective to its index
classes = { 0: "ldip50", 1: "ldip40", 2: "ldip30", 3: "ldip20", 
            4: "lpip50", 5: "lpip40", 6: "lpip30", 7: "lpip20", 
            8: "lip10",
            9: "lmcp50", 10: "lmcp40", 11: "lmcp30", 12: "lmcp20", 13: "lmcp10",
            14: "lcrpls0",
            15: "rdip50", 16: "rdip40", 17: "rdip30", 18: "rdip20",
            19: "rpip50", 20: "rpip40", 21: "rpip30", 22: "rpip20", 
            23: "rip10",
            24: "rmcp50", 25: "rmcp40", 26: "rmcp30", 27: "rmcp20", 28: "rmcp10",
            29: "rcrpls0",
            30: "ldip51", 31: "ldip41", 32: "ldip31", 33: "ldip21", 
            34: "lpip51", 35: "lpip41", 36: "lpip31", 37: "lpip21", 
            38: "lip11",
            39: "lmcp51", 40: "lmcp41", 41: "lmcp31", 42: "lmcp21", 43: "lmcp11", 
            44: "lcrpls1",
            45:"rdip51", 46: "rdip41", 47: "rdip31", 48: "rdip21", 
            49: "rpip51", 50: "rpip41", 51: "rpip31", 52: "rpip21", 
            53: "rip11",
            54: "rmcp51", 55: "rmcp41", 56: "rmcp31", 57: "rmcp21", 58: "rmcp11",
            59: "rcrpls1" }

# Scores
scores = {
    'category_1': {
        '0_small': 0,
        '1-3_small': 2,
        '4-10_small': 3,
        '>10_small': 5,
        '0_crpls': 0,
        '1_crpls': 1,
        '2_crpls':2
    },
    'category_2': {
        'anticcp': {
            'Negative': 0,
            'Low-Positive': 2,
            'Medium-Positive': 3,
            'High-Positive': 4,
        },
        'rf': {
            'Negative': 0,
            'Positive': 3
        }
    },
    'category_3': {
        'crp': {
            'Normal': 0,
            'Abnormal': 1,
        },
        'esr': {
            'Normal': 0,
            'Abnormal': 1,
        }
    },
    'category_4': {
        '<_6Weeks': 0,
        '>=_6Weeks': 1,
    },
    'final-threshold': 6
}

# Create the Flask app
app = Flask(__name__)
CORS(app)

def process_image(image):

    # Perform prediction
    results = model.predict(image, conf=0.1)

    # [[x, y, x, y, conf, cls]]
    #Converting to numpy array
    data_array = results[0].boxes.data.cpu().numpy()

    #Sorting the converted numpy array, based on the last value
    data_array = data_array[data_array[:, -1].argsort()] 

    filtered_elements = []
    # Iterate through values of x from 0 to 59
    for x in range(60):
        # Find elements with the same last value as x
        filtered_data = data_array[data_array[:, -1] == x]

        # If there are elements, find the one with the highest third value
        if len(filtered_data) > 0:
            highest_third_value_idx = np.argmax(filtered_data[:, -2])
            filtered_elements.append(filtered_data[highest_third_value_idx])

    #Converting to numpy array
    filtered_elements = np.array(filtered_elements)

    #Compare the negative and positive classes of same joint, which has highest conf, that will be retained
    deletion_indices = []
    for idx, element in enumerate(filtered_elements):
        last_value = element[-1]

        if last_value >= 30:
            break

        # Check if both x and x+30 exist
        if (last_value in filtered_elements[:, -1]) and (last_value + 30 in filtered_elements[:, -1]):
            # Find indices of elements with x and x+30
            x_idx = idx
            x_plus_30_idx = np.where(filtered_elements[:, -1] == last_value + 30)[0][0]

            # Compare third values (assuming index 2 corresponds to last but 2nd value)
            if filtered_elements[x_idx, -2] > filtered_elements[x_plus_30_idx, -2]:
                deletion_indices.append(x_plus_30_idx)
            else:
                # Keep element with x+30 (larger third value) and mark for deletion
                deletion_indices.append(x_idx)

    #Delete the lesser confidence class of same joint
    filtered_elements = np.delete(filtered_elements, deletion_indices, axis=0)

    result_list = []
    for element in filtered_elements:
        result_dict = {
            "class": classes[element[-1]],
           "confidence": float(f"{element[-2]:.2f}"),
            "x1": int(round(element[0])),
            "y1": int(round(element[1])),
            "x2": int(round(element[2])),
            "y2": int(round(element[3]))
        }
        result_list.append(result_dict)

    return result_list
    
def gender_node(data_point):
    if data_point["gender"] == 'female':
        return female_age_node(data_point)
    else:
        return male_age_node(data_point)

def male_age_node(data_point):
    if data_point["age"] <= 30:
        return rf_node_1
    else:
        return rf_node_2

def female_age_node(data_point):
    if data_point["age"] <= 30:
        return rf_node_3
    else:
        return rf_node_4

def rf_node_1(value):
    if value <= 20:
        return 0
    else:
        return 4

def rf_node_2(value):
    if value <= 25:
        return 0
    else:
        return 4
    
def rf_node_3(value):
    if value <= 18:
        return 0
    else:
        return 4
    
def rf_node_4(value):
    if value <= 22:
        return 0
    else:
        return 4

def anticcp_node(value):
    if value <= 20:
        return 0
    if value <= 39:
        return 1
    if value <= 59:
        return 2
    else:
        return 3

def crp_node(value):
    if value <= 20:
        return 5
    if value <= 39:
        return 6
    if value <= 59:
        return 6
    else:
        return 6

def esr_node(value):
    if value <= 20:
        return 5
    if value <= 39:
        return 6
    if value <= 59:
        return 6
    else:
        return 6

def make_node_prediction(data_point, test_type):
    if test_type == 'rf':
        return gender_node(data_point)
    if test_type == 'anticcp':
        return anticcp_node
    if test_type == 'crp':
        return crp_node
    if test_type == 'esr':
        return esr_node
    
def make_serology_prediction(dataObj):
    result_list = []
    status = {
        0: 'Negative',
        1: 'Low-Positive',
        2: 'Medium-Positive',
        3: 'High-Positive',
        4: 'Positive',
        5: 'Normal',
        6: 'Abnormal'
    }
    try:
        data_point = {
            'gender': dataObj.get('gender'),
            'age': int(dataObj.get('age'))
        }
        if dataObj.get('isAnticcpPresent'): 
            testValue = float(dataObj.get('anticcpValue'))
            result_list.append({
                "type": 'anticcp',
                "status": status[make_node_prediction(data_point, 'anticcp') (testValue)]
            })
        if dataObj.get('isRfPresent'): 
            testValue = float(dataObj.get('rfValue'))
            result_list.append({
                "type": 'rf',
                "status": status[make_node_prediction(data_point, 'rf') (testValue)]
            })
        if dataObj.get('isCrpPresent'): 
            testValue = float(dataObj.get('crpValue'))
            result_list.append({
                "type": 'crp',
                "status": status[make_node_prediction(data_point, 'crp') (testValue)]
            })
        if dataObj.get('isEsrPresent'): 
            testValue = float(dataObj.get('esrValue'))
            result_list.append({
                "type": 'esr',
                "status": status[make_node_prediction(data_point, 'esr') (testValue)]
            })
        return result_list

    except Exception as e:
        print(f"Error processing serology data: {e}")
        return None
    
def make_durationPrediction(dataObj):
    try:
        if int(dataObj.get('affectDuration')) >= 6:
            return 1
        return 0
    except Exception as e:
        print(f"Error processing serology data: {e}")
        return None

def calculateCategory_1_Score(imagePredictions): 

    smallJointsAffectedCount = 0
    largeJointsAffectedCount = 0
    for prediction in imagePredictions:
        currentClass = prediction.get('class')
        if currentClass[1:-1] == 'crpls':
            if currentClass[-1] == '1':
                largeJointsAffectedCount += 1
            continue

        if currentClass[-1] == '1':
            smallJointsAffectedCount += 1

    sumScore = 0
    message = ''

    if smallJointsAffectedCount == 0:
        message = 'Small joints are healthy'
        sumScore += scores.get('category_1').get('0_small')
    elif smallJointsAffectedCount > 0 and smallJointsAffectedCount <= 3:
        message = 'There are few small joints are affected by RA'
        sumScore += scores.get('category_1').get('1-3_small')
    elif smallJointsAffectedCount > 3 and smallJointsAffectedCount <= 10:
        message = 'There are more than 3 small joints affected by RA'
        sumScore += scores.get('category_1').get('4-10_small')
    elif smallJointsAffectedCount > 10:
        message = 'There are more than 10 small joints are affected by RA'
        sumScore += scores.get('category_1').get('>10_small')
    
    if largeJointsAffectedCount == 0:
        message += '\nLarge joints are healthy'
        sumScore += scores.get('category_1').get('0_crpls')
    elif largeJointsAffectedCount == 1:
        message += '\nRA might have affected large joints'
        sumScore += scores.get('category_1').get('1_crpls')
    elif largeJointsAffectedCount == 2:
        message += '\nRA has affected large joints'
        sumScore += scores.get('category_1').get('2_crpls')

    return { 'score': sumScore, 'message': message }

def calculateCategory_2_Score(bloodPredictions):

    sumScore = 0
    message = ''

    for prediction in bloodPredictions:
        if prediction.get('type') == 'anticcp':
            sumScore += scores['category_2']['anticcp'].get(prediction.get('status'))
            message += f"Your Anit-CCP (Anti-Cyclic Citrullinated Peptide) test value shows as - {prediction.get('status')}\n"
        if prediction.get('type') == 'rf':
            sumScore += scores['category_2']['rf'].get(prediction.get('status'))
            message += f"Your RF (Rheumatoid Factor) test value shows as - {prediction.get('status')}\n"

    return { 'score': sumScore, 'message': message }

def calculateCategory_3_Score(bloodPredictions):

    sumScore = 0
    message = ''

    for prediction in bloodPredictions:
        if prediction.get('type') == 'crp':
            sumScore += scores['category_3']['crp'].get(prediction.get('status'))
            message += f"Your CRP (C-Reactive Protein) test value shows as - {prediction.get('status')}\n"
        if prediction.get('type') == 'esr':
            sumScore += scores['category_3']['esr'].get(prediction.get('status'))
            message += f"Your ESR (Erythrocyte Sedimentation Rate) test value shows as - {prediction.get('status')}\n"

    return { 'score': sumScore, 'message': message }

def calculateCategory_4_Score (durationPrediction):
    score = 0
    message = ''

    if durationPrediction == 0:
        score += scores['category_4'].get('<_6Weeks')
        message += 'Based on the duration of symptoms, probability of having RA is less'
    elif durationPrediction == 1:
        score += scores['category_4'].get('>=_6Weeks')
        message += 'Based on the duration of symptoms, probability of having RA is more'

    return { 'score': score, 'message': message }

def calculateScore(imagePredictions, bloodPredictions, durationPredictions):
    resultScore = {
        'category_1': {
            'score' : 0,
            'message': ''
        },
        'category_2': {
            'score' : 0,
            'message': ''
        },
        'category_3': {
            'score' : 0,
            'message': ''
        },
        'category_4': {
            'score' : 0,
            'message': ''
        },
        'output': {
            'score': 0,
            'message': ''
        }
    }
    
    resultScore['category_1'] = calculateCategory_1_Score(imagePredictions)
    resultScore['category_2'] = calculateCategory_2_Score(bloodPredictions)
    resultScore['category_3'] = calculateCategory_3_Score(bloodPredictions)
    resultScore['category_4'] = calculateCategory_4_Score(durationPredictions)

    finalScore = resultScore['category_1']['score'] + resultScore['category_2']['score'] + resultScore['category_3']['score'] + resultScore['category_4']['score']
    print(finalScore)
    resultScore['output']['score'] = finalScore
    if finalScore < scores.get('final-threshold'):
        resultScore['output']['message'] = 'Low chance of patient being RA positive based on the supplied inputs'
    else:
        resultScore['output']['message'] = 'High chance of patient being RA positive based on the supplied inputs'

    return resultScore

@app.route('/', methods=["POST", "GET"])
def home():
    return jsonify({"error": "Please make POST request to /predict"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        image = request.json.get('image')
        imageName = image.get('name')
        imageUrl = image.get('photoUrl')
        print(imageUrl)
        if imageName == '' or imageUrl == '' :
            return jsonify({"error": "No image uploaded"})

        image_binary = base64.b64decode(imageUrl.split(",")[1])

        image_array = np.frombuffer(image_binary, np.uint8)

        # Read the image
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        #Resize the image to 640x640
        image_resized = cv2.resize(image, (640, 640))

        # Process the image and get predictions
        imagePredictions = process_image(image_resized)

        if imagePredictions is None:
            return jsonify({"error": 'image'})
        
        bloodPredictions = make_serology_prediction(request.json)

        if bloodPredictions is None:
            return jsonify({"error": 'blood'})

        durationPrediction = make_durationPrediction(request.json)

        if durationPrediction is None:
            return jsonify({"error": 'duration'})
        
        resultScore = calculateScore(imagePredictions, bloodPredictions, durationPrediction)

        return jsonify({"imagePredictions": imagePredictions, "resultScore": resultScore})

    except Exception as e:
        print(f"Error handling prediction request: {e}")
        return jsonify({"error": "An internal error occurred"})


if __name__ == "__main__":
    app.run(debug=True)