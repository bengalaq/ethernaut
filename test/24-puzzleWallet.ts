/*

_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ 
ESTE CHALLENGE DEBERÁ TENER VIDEO, PUESTO QUE HAY PROBLEMAS DE INCOMPATIBILIDAD ENTRE VERSIONES DE CONTRATOS DE OZ Y SE HACE INCÓMODO DE TRABAJAR CON ETHERS Y HARDHAT EN EL MISMO PROYECTO QUE CHALLENGES ANTERIORES.
_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

*/

// PARA EXPLICACIÓN:

// Qué deployó en qué dirección ethernaut, o sea el proxy y la implementación --> Cuaderno
// Como no supe tomar proxy address desde ethers (tenía que hacérselo saber de alguna forma), exploré el contrato implementación en etherscan. Miré la transacción y encontré qué address era la del proxy. También está la herramienta de "is this a proxy" pero no la encontré muy amigable (tira cartel rojo como si hubiera un error).

// CARACTERÍSTICAS DE PROXIES

// Contrato sin constructor
// Contrato con initializer -> q solo se debería llamar 1 vez
// Contrato no debe tener delegatecall o selfdestruct
// No se pueden modificar variables de estado existentes
// No pueden usarse variables inmutables.
// En UUPS -> Si la implementación no tiene función upgradeTo, se pierde la posibilidad de upgradear.

// IDEAS:

// Si pudiera pisar el valor maxBalance con mi address, me volvería admin.
// Para modificar maxBalance necesito usar la función setMaxBalance.
//     1) Debo pasar el modifier onlyWhitelisted.
            // 1.1) Para estar en la whitelist tengo que agregar mi address con la función addToWhitelist.
            //     Para usar la función addToWhitelist la variable owner debe ser mi address. 
            //     Para que la variable owner sea mi address, puedo usar la colision del slot 0 en el storage.
            //     Para hacer uso de esta vulnerabilidad uso la función proposeNewAdmin en el contrato Proxy PuzzleProxy.
//     2) El balance del contrato debe ser 0
            // 2.1) Debo quitar los 0.001 ether que figuran en la implemetación (se puede ver desde Etherscan o en console con await getBalance(contract.address)).
            //    La única función que me permite mover los fondos del contrato es execute en la línea que usa "call".
            //    Debo sortear un require que pide que mi balance sea mayor al que quiero transferir.
            //    Para esto tengo que de alguna forma, desconectar la relación de mi balance con lo que realmente tengo. Y la única funcion capaz de aumentar mi balance es "deposit", por lo que procedemos a analizarla.
                // 2.1.1)    Para generar esta desconexión, la única alternativa que tenemos es que la línea con balances[msg.sender] = balances[msg.sender].add(msg.value) se ejecute con el mismo value repetidas veces. Para esto tenemos la función "multicall".
                // 2.1.2)    Multicall es una función que fue creada para ahorrar gas, enviando un array de data con varias funciones encodeadas. No obstante, la misma tiene una protección contra lo que queremos hacer (llamar varias veces a la función deposit). 
                
                /*require(!depositCalled, "Deposit can only be called once");
                // Protect against reusing msg.value
                depositCalled = true;
                */

                // 2.1.3)   Si observamos el inicio de la función multicall, podemos ver que el flag "depositCalled" es setteado a false, por lo que si pudieramos llamar a deposit, y luego a otra multicall (que inicialmente resetea el flag), podríamos llamar 2 veces a "deposit", lo cual es más que suficiente para nosotres.