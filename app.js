'use strict';

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';

function main() {
  // create WebGLRenderer
  const canvas = document.querySelector('#canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas
  });

  // create camera
  const fov = 60;
  const aspect = 2;
  const near = 0.1;
  const far = 200;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 30;

  // create scene and assign its color to white
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  // 카메라를 봉(pole) 오브젝트에 추가해서 봉을 회전시키면 카메라가 장면 주위를 공전할 수 있도록 함.
  const cameraPole = new THREE.Object3D();
  scene.add(cameraPole);
  cameraPole.add(camera);

  // create directionalLight(직사광)
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    camera.add(light); // 카메라에 조명을 자식노드로 추가해 카메라가 장면 주위를 공전할 때마다 조명이 따라다니면서 카메라 위치에서 빛을 쏴주도록 함.
  }

  // create boxGeometry
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  // 최솟값과 최댓값을 인자로 넘겨주면 그 사이의 랜덤값을 리턴해주는 함수
  // 얘를 왜 만들었냐고? 100개의 큐브 메쉬를 만들건데, 각 큐브 메쉬의 색상값, 위치값, 회전값, 크기값을 랜덤으로 지정해주려고
  function random(min, max) {
    if (max === undefined) {
      // max값을 전달받지 못한 경우, 보통은 값을 1개만 전달받은 경우겠지 주로.
      // 그런 경우에는 전달받은 1개의 값은 max에 할당하고, min에는 0을 할당하라는 뜻
      max = min;
      min = 0;
    }

    return min + (max - min) * Math.random(); // min ~ max 사이의 랜덤값 리턴
  }

  // 큐브 메쉬의 퐁-머티리얼을 생성할 때 color에 할당할 색상값을 hsl로 리턴해 줌. 이 때 hue, saturation값을 랜덤으로 리턴받아 옴.
  // 참고로 three.js에서는 color값을 hsl-string으로도 할당받을 수 있게 되어있음. 이외에도 rgb-string, hexcode, hexcode-string, color-name-string 등 여러가지 방법으로 할당할 수 있음.
  function randomColor() {
    /**
     * hue값과 saturation값을 계산할 때 random() 함수에서 리턴받은 값을 '비트 OR 연산자'를 이용해서 연산하고 있음.
     * 
     * 이거는 뭐냐면, random(360) | 0 이라고 치면, 랜덤으로 받은 값과 0을 32개의 비트(0과 1)로 이루어진 이진수로 변환한 뒤,
     * 두 피연산자의 대응되는 비트에서 둘 중 하나가 1이거나 둘 다 1이면 그 자리에 1을 리턴해 주는 연산을 해줌.
     * 
     * 그런데 지금 십진수 0은 이진수로 변환해도 0이잖아. 
     * 그럼 랜덤한 숫자가 뭐가 됬든 결국 똑같은 값으로 나올거 아냐? OR 연산자니까
     * 그런데 중요한 건 random() 함수는 0 ~ 360까지의 '실수'를 랜덤하게 리턴해주기 때문에 소수점 이하 자리수가 포함된 실수를 받게 될거고
     * 얘를 비트연산자로 연산한 결과물은 '부호가 있는 32비트 정수로 반환된다'는 게 중요함!
     * 또 비트연산자는 결과물을 표준 javascript 숫자값, 즉 10진수로 반환해 줌.
     * 결과적으로 부호가 있는 10진수 정수로 반환해준다는 거지!
     * 
     * 그래서 결국 똑같은 숫자를 리턴해주겠지만 비트 연산자를 통해서 소수점 아래를 제거하기 위해서 비트 연산을 진행해 준거임.
     * 근데 Math.ceil, round, floor 등 소수점을 제거해서 정수를 리턴해주는 메서드는 많은데 왜 굳이 비트연산자로 해준걸까?
     * 비트연산과 메서드를 사용한 소수점 제거를 비교해보면 비트연산이 약간 더 빠르기 때문에 그렇다고 함.
     * 관련 내용이 잘 정리된 블로그를 북마크로 저장해놨으니 참고할 것.
     */
    return `hsl(${random(360) | 0}, ${random(50, 100) | 0}%, 50%)` // hue값은 0 ~ 360 사이의 정수, saturation값은 50 ~ 100 사이의 정수가 들어가겠군
  }

  const numObjects = 100; // 랜덤으로 생성할 큐브 메쉬 개수
  for (let i = 0; i < numObjects; i++) {
    // 랜덤으로 색상값을 할당받은 퐁-머티리얼을 100개 생성함.
    const material = new THREE.MeshPhongMaterial({
      color: randomColor()
    });

    // for loop 밖에서 생성한 박스 지오메트리와 for loop 안에서 반복 생성한 각각의 퐁-머티리얼을 이용해서 큐브 메쉬를 생성하고, 씬에 각각 추가함
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 각 큐브 메쉬의 위치값, 회전값, 크기값을 랜덤으로 할당해 줌
    cube.position.set(random(-20, 20), random(-20, 20), random(-20, 20));
    cube.rotation.set(random(Math.PI), random(Math.PI), 0); // x, y축 방향으로만 랜덤 각도를 리턴받을거임. 이 때 Math.PI는 degree로 변환하면 180도니까 0 ~ 180도 사이의 각도값이 할당되겠지
    cube.scale.set(random(3, 6), random(3, 6), random(3, 6)); // 각 큐브는 width, height, depth 모두 3 ~ 6 사이로 랜덤하게 받으니 정육면체는 아니겠군.
  }

  // resize renderer
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  // 피킹을 관리할 헬퍼클래스를 만듦.
  /**
   * new THREE.Raycaster();
   * 
   * THREE.js에서 피킹을 구현하는 가장 흔한 방법으로 광선 투사(ray casting)을 이용하는 방법임.
   * 포인터(커서)의 좌표 지점에서 씬의 절두체로 광선을 쏴 광선이 닿는 물체를 감지함.
   * 
   * Raycaster 클래스는 이를 도와주는 역할을 하는데, 만약 씬 안에 물체가 100개 있다고 치면,
   * 1. 각각의 물체를 감싼 경계(bounding)좌표가 광선과 교차하는지 확인하고,
   * 2. 교차하는 물체에 대해서만 각 물체의 삼각형과 광선이 교차하는지 확인함.
   * 
   * 그래서 교차하는 물체들만 배열로 묶어서 리턴해 줄 수 있음.
   */
  class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster(); // raycaster 객체를 생성함
      this.pickedObject = null; // 광선과 교차하는 물체들이 담긴 배열의 첫번째 물체를 리턴받아 할당할거임.
      this.pickedObjectSavedColor = 0; // 첫번째 물체는 picked 되었으므로 색깔을 빨강/노랑으로 빛나게 만들건데, 나중에 이 물체의 색상을 다시 초기화하기 위해 초기 색상값을 저장해 놓은 것.
    }

    pick(normalizedPosition, scene, camera, time) {
      if (this.pickedObject) {
        // pick 메서드를 animate 함수에서 매 프레임마다 호출할건데
        // pickedObject는 항상 emissive의 색상값을 타임스탬프값에 따라 빨강/노랑으로 빛나게 만들어 줌.
        // 그런데 몇 프레임동안 같은 pickedObject가 할당된다고 하더라도,
        // 일단 이전 프레임에서 pickedObject가 할당되었다면, 다음 프레임에 pick 메서드를 호출할 때는
        // if block에 의해서 pickedObject의 emissive 컬러값과 pickedObject 자체를 매 프레임마다 초기화해주고 들어가도록 하는거임.
        // 그래야 현재 프레임에서 혹시라도 다른 pickedObject가 할당되었을 때 이전 pickedObject의 emissive 색상값을 미리 초기화해두면 이후에 따로 초기화할 필요가 없으니까 그런 것이지.
        this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
        this.pickedObject = undefined;
      }

      // setFromCamera 메서드는 정규화된 2d 좌표값 지점에서 카메라의 절두체 안으로 광선을 쏴줌.
      // setFromCamera는 x, y값이 각각 -1 ~ 1 사이인 정규화된 2d 좌표값과 카메라를 넘겨줘야 됨. 이거에 대해서는 setPickPosition() 함수에 더 자세하게 정리해 놓음.
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // intersectObjects 메서드는 여러 개의 객체들이 담견 배열을 넘겨받으면, 그 안의 객체들이 광선과 교차하는지 체크하고, 
      // 광선과 교차하는 객체들이 존재한다면, 먼저 교차하는 객체들 순서로 배열을 만들어서 리턴해 줌.
      const intersectedObjects = this.raycaster.intersectObjects(scene.children); // 씬 안의 모든 자식노드들에 대해서 광선 교차 여부를 체크함.

      // intersectedObjects.length가 true라는 뜻은, intersectedObjects의 배열의 길이가 0이 아니라는 뜻이고,
      // 그 말은 넘겨준 객체 배열들 중에서 광선과 교차하는 객체들이 1개 이상은 존재한다는 뜻임. 
      // 그럴 때에만 if block을 수행해 주라는 뜻.
      if (intersectedObjects.length) {
        // 광선과 교차하는 객체 모음 중 첫 번째, 즉, 광선과 가장 먼저 교차하면서 카메라에서 가장 가까운 객체를 pickedObject에 할당함.
        this.pickedObject = intersectedObjects[0].object;
        /**
         * pickedObject의 emissive 컬러값을 hexcode로 리턴받아서 담아놓음.
         * 
         * material.emissive는 물체에서 빛을 방출할 때, 그 빛의 색상값을 지정해 줌.
         * 
         * 1. 이 색상값은 일단 light(조명)의 영향을 받지 않으므로 조명의 위치에 따라 바뀌지 않으며
         * 2. 별도로 지정하지 않는다면 기본값은 black임.
         * 
         * 각 큐브 메쉬의 퐁-머티리얼을 생성했을 때 별도로 emissive 색상값을 지정하지는 않았으므로,
         * 모든 큐브들의 emissive 기존 색상값은 'black'으로 저장될거임.
         */
        this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
        /**
         * 타임스탬프 * 8 값을 2로 나눈 나머지가 1보다 크면 노란색, 1보다 작으면 빨강색으로 pickedObject의 emissive 색상값을 할당해 줌.
         * 
         * 이 때, 타임스탬프값은 매 프레임마다 0.016씩 더해지는 값이 전달될텐데,
         * 어떤 경우에는 나머지가 1보다 크고, 어떤 경우에는 나머지가 1보다 작은걸까?
         * 
         * 이거는 아주 간단하게 알 수 있는 게, 타임스탬프값은 기본적으로 소수점 이하 자릿수까지 표현된 값이므로,
         * 정수 부분이 0이거나 짝수면 2로 나눈 나머지가 0.XXX, 정수 부분이 홀수면 2로 나눈 나머지가 1.XXX이기 때문에
         * 타임스탬프값의 정수 부분이 짝수냐 홀수냐에 따라 나머지가 0보다 크냐 작냐를 판단할 수 있겠지 
         */
        this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
      }
    }
  }

  // pickPosition은 setPickPosition() 함수에 의해 마우스 포인터 좌표값을 정규화한 좌표값이 할당되거나, 
  // clearPickPosition에 의해 어떤 객체도 선택할 수 없는 좌표값이 할당될거임.
  const pickPosition = {
    x: 0,
    y: 0
  };
  const pickHelper = new PickHelper(); // 헬퍼 클래스의 인스턴스를 미리 생성해놓음
  clearPickPosition(); // pickPosition의 좌표값을 맨 처음에는 어떤 객체도 선택하지 못하는 좌표값으로 초기화해놓음
  // 즉, 초기의 좌표값 상태를 마우스가 브라우저 창을 떠나있거나(mouseout, mouseleave), 모바일에서 터치를 뗀 상태(touchend)와 동일하게 만드는거임.

  // animate
  function animate(t) {
    t *= 0.001; // 밀리초 단위의 타임스탬프값을 초 단위로 변환

    // 렌더러가 리사이징되면 바뀐 사이즈에 맞춰서 카메라의 비율(aspect)도 업데이트해줌
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // 매 프레임마다 카메라의 부모노드인 봉(cameraPole) 객체를 y방향으로 회전시켜 줌
    cameraPole.rotation.y = t * 0.1;

    // 매 프레임마다 pick 메서드를 호출해서 정규화된 좌표값에서 쏜 광선과 가장 먼저 교차하는 물체를 항상 갱신해서 걔의 emissive 색상값을 반짝거리게 해줌.
    pickHelper.pick(pickPosition, scene, camera, t);

    renderer.render(scene, camera);

    requestAnimationFrame(animate); // 내부에서 반복 호출
  }

  requestAnimationFrame(animate);

  // mousemove 이벤트의 좌표값을 캔버스의 상대적 좌표값으로 변환하는 함수
  function getCanvasRelativePosition(e) {
    const rect = canvas.getBoundingClientRect(); // 캔버스 요소의 DOMRect 객체를 리턴받음

    // 얘는 어지간하면 mousemove 이벤트와 동일한 좌표값을 리턴해줄거임.
    // 왜냐면, 캔버스를 브라우저의 100%로 채워놨기 때문에
    // rect.left, top은 0일테고, 
    // 리사이징 함수에서 캔버스 렌더러의 픽셀 사이즈를 css 사이즈와 동일하게 맞춰주고 있으므로 
    // canvas.width, height(즉, 캔버스의 픽셀값)은 rect.width, height(즉, 캔버스의 css 사이즈)와 동일함.
    // 그렇게 치면 결국 e.clientX,Y와 동일한 값으로 계산되겠지 
    return {
      x: (e.clientX - rect.left) * canvas.width / rect.width,
      y: (e.clientY - rect.top) * canvas.height / rect.height
    }
  }

  /**
   * mousemove 이벤트의 좌표값을 받아와서 정규화된 좌표값으로 변환하여 pickPosition에 할당해주는 함수.
   * 
   * 정규화(normalizing)이란 무엇인가?
   * 특정 길이를 가지는 벡터가 존재한다고 할 때, 그 벡터를 방향은 같지만, 벡터의 길이는 1인 '단위벡터'로 만들어주는 과정을 의미함.
   * 
   * 벡터의 길이는 어떻게 구할 수 있는데?
   * 예를 들자면, mousemove 이벤트의 좌표값은 2D Vector 로 표현할 수 있겠지?
   * (a, b) 이런 식으로 2D Vector가 하나 있다고 치면, 이 벡터는 (0, 0)에서 (a, b)까지의 방향과 길이를 갖는 선이라고도 볼 수 있음.
   * 이 선의 길이 = 벡터의 길이 = 벡터의 크기 = norm 이라고 하며, 이거를 구하는 방법은 직각삼각형의 빗변의 길이를 구하는 공식과 동일해서
   * Math.sqrt((a * a) + (b * b))로 표현할 수 있음. 
   * 
   * 이 값이 1이 되도록 하는 좌표값 (a', b')를 구하는 게 이 함수의 역할임.
   * 그래서 이 좌표값은 보통 x, y값이 -1 ~ 1 사이의 값으로 되어있음.
   * 반지름이 1인 원의 좌표값을 생각해보면 됨. 
   * 그 원의 좌표값의 벡터 길이를 구하면 반지름이 1이기 때문에 죄다 1로 나올테니까.
   * 
   * 이 값을 왜 구해야 되냐고? Raycaster.setFromCamera(Vector2, camera) 메서드가 
   * 마우스의 좌표값을 정규화된 2D 벡터값으로만 받기 때문에 구해야 하는거지. 
   * 이 메서드는 캔버스 크기와 상관없이, 왼쪽 끝이 -1, 오른쪽 끝이 +1인 x축과 위쪽 끝이 +1, 아래쪽 끝이 -1인 y축 내에 존재하는 좌표값을 필요로 하기 때문임.
   * 캔버스의 크기는 리사이징이나 모니터 해상도에 의해 제각각으로 할당되지만, 이 메서드는 위와 같은 좌표계 상의 좌표값을 필요로 하기 때문에.
   */
  function setPickPosition(e) {
    const pos = getCanvasRelativePosition(e);

    // pos.x / canvas.width는 0 ~ 1 사이의 값일거고, 여기에 2를 곱하면 0 ~ 2 사이의 값, 1을 빼면 -1 ~ 1사이의 값이 나오겠지?
    pickPosition.x = (pos.x / canvas.width) * 2 - 1;
    // pos.y / canvas.height는 0 ~ 1 사이의 값일거고, 여기에 -2를 곱하면 0 ~ -2 사이의 값, 1을 더하면 1 ~ -1 사이의 값이 나오겠지?
    // 그런데 -2를 곱해줘서 y좌표값을 반대로 뒤집었음. 왜냐? 2D 픽셀 좌표계와 3D 공간 좌표계는 y축의 방향이 반대이기 때문에 뒤집어준거임.
    pickPosition.y = (pos.y / canvas.height) * -2 + 1;
  }

  function clearPickPosition() {
    /**
     * 마우스의 경우 항상 위치값이 할당되니 상관없지만,
     * 모바일 터치는 사용자가 손가락을 떼면 피킹을 멈춰야 하는데, 좌표값이 그대로 남아있는 경우가 있음.
     * 
     * 그래서 이런 부분들을 모두 고려해서
     * 코드가 처음 실행되거나, 마우스가 브라우저 창을 떠나거나, 터치가 끝나는 상황에서는
     * setFromCamera 메서드가 아무것도 선택할 수 없는 값으로 좌표값을 할당해주는 것.
     */
    pickPosition.x = -100000;
    pickPosition.y = -100000;
  }

  // 마우스가 브라우저 창에서 움직이면 setPickPosition() 호출, 브라우저를 떠나면 clearPickPosition() 호출함.
  window.addEventListener('mousemove', setPickPosition);
  window.addEventListener('mouseout', clearPickPosition);
  window.addEventListener('mouseleave', clearPickPosition);

  // 터치를 시작하거나, 터치 후 움직이면 setPickPosition() 호출, 손가락을 떼서 터치를 끝내면 clearPickPosition() 호출함.
  window.addEventListener('touchstart', (e) => {
    e.preventDefault(); // 브라우저에서 정의된 기본 터치 이벤트(스크롤)을 비활성화 함 
    setPickPosition(e.touches[0]); // touchmove의 경우 이벤트의 clientX,Y 좌표값이 담긴 부분이 e.touches[0]인가 봄.
  }, {
    passive: false
  }); // addEventListener에서 passive값을 true로 전달하면 listener가 지정한 콜백함수가 preventDefault를 호출하지 않도록 함. 그럼 false면 당연히 호출하도록 하겠지? 

  window.addEventListener('touchmove', (e) => {
    setPickPosition(e.touches[0]);
  })

  window.addEventListener('touchend',
    clearPickPosition);
}

main();