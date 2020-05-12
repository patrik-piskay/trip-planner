import express from 'express';
import EV from 'express-validator';
import * as UserModel from '../models/user.js';
import * as TripModel from '../models/trip.js';
import auth from '../middleware/auth.js';
import { catchErrors } from '../handlers/errorHandlers.js';

const tripRouted = express.Router();

const dateValidator = (value) => {
  return value.match(/^\d{4}\/\d{2}\/\d{2}$/);
};

tripRouted.post(
  '/trips',
  auth,
  [
    EV.check('user_id').optional().notEmpty().withMessage('field cannot be empty'),
    EV.check('destination').trim().notEmpty().withMessage('field is required'),
    EV.check('start_date')
      .notEmpty()
      .withMessage('field is required')
      .bail()
      .custom((value) => dateValidator(value))
      .withMessage('date is in a wrong format. required format is YYYY/MM/DD'),
    EV.check('end_date')
      .notEmpty()
      .withMessage('field is required')
      .bail()
      .custom((value) => dateValidator(value))
      .withMessage('date is in a wrong format. required format is YYYY/MM/DD'),
    EV.body('comment').trim(),
  ],
  catchErrors((req, res) => {
    // create a new trip

    const validationErrors = EV.validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).send({ errors: validationErrors.array() });
    }

    const { user_id, destination, start_date, end_date, comment } = req.body;

    if (req.user.role_id === UserModel.ROLE.USER) {
      if (user_id && user_id !== req.user.id) {
        return res.status(403).send({ error: 'Cannot create resource on behalf of another user' });
      }
    }

    const userId = user_id || req.user.id;

    if (!UserModel.getUserById(userId)) {
      return res.status(409).send({ error: `User ID '${userId}' does not exist` });
    }

    const trip = TripModel.createTrip({
      user_id: userId,
      destination,
      start_date,
      end_date,
      comment,
    });

    res.status(201).send(trip);
  }),
);

tripRouted.get(
  '/trips',
  auth,
  catchErrors((req, res) => {
    // get all trips

    if (req.user.role_id === UserModel.ROLE.USER_MANAGER) {
      // forbidden
      return res.status(403).send();
    }

    const options = {};

    if (req.user.role_id === UserModel.ROLE.USER) {
      options.user_id = req.user.id;
    }

    const trips = TripModel.getAllTrips(options);

    res.status(200).send(trips);
  }),
);

tripRouted.get(
  '/trips/:id',
  auth,
  catchErrors((req, res) => {
    // get trip detail

    if (![UserModel.ROLE.USER, UserModel.ROLE.ADMIN].includes(req.user.role_id)) {
      // forbidden
      return res.status(403).send();
    }

    const tripId = req.params.id;
    const trip = TripModel.getTripById(tripId);

    if (trip) {
      if (req.user.role_id === UserModel.ROLE.USER && trip.user_id !== req.user.id) {
        // forbidden
        return res.status(403).send();
      }

      res.status(200).send(trip);
    } else {
      res.status(404).send({ error: 'Not found' });
    }
  }),
);

tripRouted.patch(
  '/trips/:id',
  auth,
  [
    EV.check('destination').optional().trim().notEmpty().withMessage('field cannot be empty'),
    EV.check('start_date')
      .optional()
      .notEmpty()
      .withMessage('field cannot be empty')
      .bail()
      .custom((value) => dateValidator(value))
      .withMessage('date is in a wrong format. required format is YYYY/MM/DD'),
    EV.check('end_date')
      .optional()
      .notEmpty()
      .withMessage('field cannot be empty')
      .bail()
      .custom((value) => dateValidator(value))
      .withMessage('date is in a wrong format. required format is YYYY/MM/DD'),
    EV.body('comment').optional().trim(),
  ],
  catchErrors((req, res) => {
    // edit trip detail

    const validationErrors = EV.validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).send({ errors: validationErrors.array() });
    }

    if (![UserModel.ROLE.USER, UserModel.ROLE.ADMIN].includes(req.user.role_id)) {
      // forbidden
      return res.status(403).send();
    }

    const tripId = req.params.id;
    const { destination, start_date, end_date, comment } = req.body;

    const trip = TripModel.getTripById(tripId);

    if (!trip || trip.archived_at) {
      return res.status(404).send({ error: 'Not found' });
    }

    if (req.user.role_id === UserModel.ROLE.USER && trip.user_id !== req.user.id) {
      // forbidden
      return res.status(403).send();
    }

    const updatedTrip = TripModel.updateTrip(tripId, {
      destination,
      start_date,
      end_date,
      comment,
    });

    res.status(200).send(updatedTrip);
  }),
);

tripRouted.delete(
  '/trips/:id',
  auth,
  catchErrors((req, res) => {
    // delete trip detail

    if (![UserModel.ROLE.USER, UserModel.ROLE.ADMIN].includes(req.user.role_id)) {
      // forbidden
      return res.status(403).send();
    }

    const tripId = req.params.id;

    const trip = TripModel.getTripById(tripId);

    if (!trip || trip.archived_at) {
      return res.status(404).send({ error: 'Not found' });
    }

    if (req.user.role_id === UserModel.ROLE.USER && trip.user_id !== req.user.id) {
      // forbidden
      return res.status(403).send();
    }

    TripModel.deleteTrip(tripId);

    res.status(204).send({});
  }),
);

export default tripRouted;
