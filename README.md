# A Deep Learning Approach to Detect Rheumatoid Arthritis Using X-Ray Images and Bio-Markers

Rheumatoid arthritis (RA) is a chronic autoimmune condition primarily affecting joints, where the immune system mistakenly targets healthy tissues, leading to symptoms such as joint pain, swelling, stiffness, and reduced function. Managing RA poses significant clinical challenges due to its persistent nature and potential for joint deformities and systemic complications. Conventional diagnostic methods often fall short of providing precise and timely detection, necessitating innovative approaches. With this in mind, a newly developed system integrates deep learning techniques with multi-modal data, including blood biomarkers and therapeutic images of affected hand joints, aiming to revolutionize RA diagnosis and severity assessment.

By leveraging a comprehensive dataset and considering symptom duration, this approach surpasses the limitations of existing methods, offering superior diagnostic accuracy and early detection capabilities. Through rigorous evaluation, the system demonstrates reduced false positives and false negatives, thereby improving patient outcomes and minimizing long-term joint damage. Additionally, this novel system contributes to advancing the understanding of RA pathophysiology and treatment effectiveness by generating a comprehensive dataset.

As part of the integration process, the American College of Rheumatology/European League Against Rheumatism (ACR/EULAR) 2010 criteria are incorporated, and the system is refined by leveraging existing frameworks or discovered techniques. Specifically, the research focuses on automating RA severity assessment using Deep Learning algorithms with hand X-ray images. Despite these advancements, challenges persist in accurately distinguishing early RA symptoms from common variations or other joint disorders, as well as in detecting subtle joint abnormalities. To enhance diagnostic accuracy and further our understanding of treatment outcomes in RA, machine learning methodologies and multi-modal data integration are utilized.

## Technologies Utilized
- Angular JS (Frontend)
- Flask (Backend)
- Database (MongoDB)



Based on the comparative analysis of various YOLO models for RA detection in X-ray images, YOLOv9c emerged as the optimal choice due to its favorable balance between speed, model compactness, and diagnostic efficacy. This compact variant of the YOLOv9 family was specifically selected for its ability to maintain high performance while minimizing computational overhead. The chosen model underwent training using a dataset comprising 3,717 X-ray images, which were augmented through four-fold rotation, resulting in approximately 14,490 images to enhance training robustness. The resultant model demonstrated impressive precision (0.85), recall (0.893), mAP@0.50 (0.912), and mAP@0.50:0.95 (0.83), indicative of its high accuracy in localizing RA-affected joints.

## Installation

### Frontend setup

This project is developed using the [Angular CLI](https://github.com/angular/angular-cli) version 17.1.0.

Use the package manager [npm](https://nodejs.org/en/download/prebuilt-installer).

```bash
cd frontend
npm i
```
To run development server,

```bash
ng serve
```
Navigate to `http://localhost:4200`.

### Backend setup

This project is developed using the [Python](https://www.python.org/downloads/) version 3.10.

Use the package manager [pip](https://pypi.org/project/pip/).

```bash
cd backend
pip install -r requirements.txt
```

Setup environment variables, by referring .env.example file.

To run flask server,

```bash
flask run
```